"""Mobile API backed by the same MongoDB users and leads as the website."""

from datetime import datetime, timedelta, timezone
import os
import tempfile
from typing import Any

import bcrypt
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, Field
from pymongo import MongoClient

from app.config import settings
from app.services.ai_service import get_ai_provider

router = APIRouter(prefix="/shared", tags=["Shared website data"])
bearer = HTTPBearer()
_client: MongoClient | None = None


def _db():
    global _client
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=503, detail="MONGODB_URI is not configured")
    if _client is None:
        _client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
    return _client[settings.MONGODB_DATABASE]


def _json(value: Any):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, list):
        return [_json(item) for item in value]
    if isinstance(value, dict):
        return {key: _json(item) for key, item in value.items() if key != "passwordHash"}
    return value


def _user_doc(user):
    return {"id": str(user["_id"]), "email": user["email"],
            "full_name": user.get("name", ""), "company": user.get("companyName"),
            "phone": user.get("phone")}


def _token(user):
    return jwt.encode({"userId": str(user["_id"]), "email": user["email"],
                       "exp": datetime.now(timezone.utc) + timedelta(days=30)},
                      settings.JWT_SECRET_KEY, algorithm="HS256")


def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    try:
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("userId")
        if not user_id or not ObjectId.is_valid(user_id):
            raise ValueError("invalid user")
        user = _db().users.find_one({"_id": ObjectId(user_id)})
        if user is None:
            raise ValueError("unknown user")
        return user
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired account token")


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class RegisterBody(LoginBody):
    fullName: str = Field(min_length=1, max_length=120)
    company: str = Field(default="", max_length=160)


class CallBody(BaseModel):
    client_call_id: str | None = None
    contact_id: str | None = None
    contact_name: str = Field(min_length=1, max_length=160)
    phone_number: str = Field(default="", max_length=40)
    call_type: str = "OUTGOING"
    source: str = "AUTO_LOGGED"
    duration_seconds: int = Field(default=0, ge=0, le=86400)
    timestamp: datetime | None = None
    notes: str | None = Field(default=None, max_length=10000)
    summary: str | None = Field(default=None, max_length=10000)
    follow_up_date: datetime | None = None


class NoteBody(BaseModel):
    contact_id: str | None = None
    call_record_id: str | None = None
    title: str = Field(min_length=1, max_length=240)
    content: str = Field(default="", max_length=20000)
    tags: list[str] = Field(default_factory=list)
    is_pinned: bool = False


class ReminderBody(BaseModel):
    call_record_id: str | None = None
    contact_id: str | None = None
    contact_name: str | None = None
    contact_phone: str | None = None
    title: str = Field(min_length=1, max_length=240)
    description: str | None = None
    due_date_time: datetime
    priority: str = "MEDIUM"


@router.post("/auth/login")
def login(data: LoginBody):
    user = _db().users.find_one({"email": data.email.lower().strip()})
    if not user or not bcrypt.checkpw(data.password.encode(), user["passwordHash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = _token(user)
    return {"token": {"access_token": token, "refresh_token": token, "expires_in": 2592000},
            "user": _user_doc(user)}


@router.post("/auth/register", status_code=201)
def register(data: RegisterBody):
    db = _db()
    email = data.email.lower().strip()
    if db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = {"name": data.fullName.strip(), "email": email,
            "passwordHash": bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode(),
            "companyName": data.company.strip(), "teamSize": "1-5", "role": "admin",
            "createdAt": datetime.now(timezone.utc), "updatedAt": datetime.now(timezone.utc)}
    user["_id"] = db.users.insert_one(user).inserted_id
    token = _token(user)
    return {"token": {"access_token": token, "refresh_token": token, "expires_in": 2592000},
            "user": _user_doc(user)}


@router.get("/auth/me")
def profile(user=Depends(current_user)):
    return _user_doc(user)


def _as_contact(lead):
    return {"id": str(lead["_id"]), "name": lead.get("fullName", ""),
            "phone_number": lead.get("phoneNumber", ""), "email": lead.get("workEmail"),
            "company": lead.get("company"), "job_title": None,
            "tags": lead.get("tags", []), "total_calls": lead.get("callCount", 0),
            "is_favorite": False, "created_at": _json(lead.get("createdAt"))}


@router.get("/leads")
def list_leads(user=Depends(current_user), search: str | None = None):
    query = {"userId": str(user["_id"]), "type": "crm"}
    leads = list(_db().leads.find(query).sort("createdAt", -1).limit(500))
    if search:
        term = search.casefold()
        leads = [lead for lead in leads if term in " ".join(str(lead.get(field, "")) for field in
                 ("fullName", "phoneNumber", "workEmail", "company")).casefold()]
    return [_as_contact(lead) for lead in leads]


@router.get("/leads/{lead_id}")
def get_lead(lead_id: str, user=Depends(current_user)):
    if not ObjectId.is_valid(lead_id):
        raise HTTPException(status_code=404, detail="Lead not found")
    lead = _db().leads.find_one({"_id": ObjectId(lead_id), "userId": str(user["_id"])})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return _as_contact(lead)


@router.post("/leads")
def create_lead(data: dict, user=Depends(current_user)):
    name = (data.get("name") or data.get("fullName") or "").strip()
    phone = (data.get("phone_number") or data.get("phoneNumber") or "").strip()
    email = (data.get("email") or data.get("workEmail") or "").strip().lower()
    if not name or not (phone or email):
        raise HTTPException(status_code=400, detail="Name and phone or email are required")
    now = datetime.now(timezone.utc)
    lead = {"userId": str(user["_id"]), "fullName": name, "phoneNumber": phone,
            "workEmail": email, "company": data.get("company"), "type": "crm",
            "status": "new", "priority": "medium", "notes": [], "tags": data.get("tags", []),
            "source": "CallPilot", "callCount": 0, "createdAt": now, "updatedAt": now}
    lead["_id"] = _db().leads.insert_one(lead).inserted_id
    return _as_contact(lead)


@router.put("/leads/{lead_id}")
def update_lead(lead_id: str, data: dict, user=Depends(current_user)):
    if not ObjectId.is_valid(lead_id):
        raise HTTPException(status_code=404, detail="Lead not found")
    mapping = {"name": "fullName", "phone_number": "phoneNumber", "email": "workEmail",
               "company": "company", "tags": "tags"}
    values = {mapping[key]: value for key, value in data.items() if key in mapping}
    values["updatedAt"] = datetime.now(timezone.utc)
    result = _db().leads.update_one({"_id": ObjectId(lead_id), "userId": str(user["_id"])}, {"$set": values})
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Lead not found")
    return get_lead(lead_id, user)


@router.delete("/leads/{lead_id}", status_code=204)
def delete_lead(lead_id: str, user=Depends(current_user)):
    if not ObjectId.is_valid(lead_id):
        raise HTTPException(status_code=404, detail="Lead not found")
    result = _db().leads.delete_one({"_id": ObjectId(lead_id), "userId": str(user["_id"])})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Lead not found")


@router.get("/calls")
def list_calls(user=Depends(current_user)):
    calls = list(_db().mobile_calls.find({"userId": str(user["_id"])}).sort("timestamp", -1).limit(500))
    return [{**_json(call), "id": str(call["_id"]), "contact_id": call.get("leadId")} for call in calls]


@router.post("/calls")
def create_call(data: CallBody, user=Depends(current_user)):
    db = _db()
    user_id = str(user["_id"])
    existing = db.mobile_calls.find_one({"userId": user_id, "client_call_id": data.client_call_id}) if data.client_call_id else None
    lead = None
    if data.contact_id and ObjectId.is_valid(data.contact_id):
        lead = db.leads.find_one({"_id": ObjectId(data.contact_id), "userId": user_id})
    if lead is None and data.phone_number:
        lead = db.leads.find_one({"userId": user_id, "phoneNumber": data.phone_number})

    now = datetime.now(timezone.utc)
    timestamp = data.timestamp or now
    summary = (data.summary or data.notes or "").strip()
    call = {"userId": user_id, "leadId": str(lead["_id"]) if lead else None,
            "client_call_id": data.client_call_id,
            "contact_id": str(lead["_id"]) if lead else None,
            "contact_name": data.contact_name.strip(), "phone_number": data.phone_number,
            "call_type": data.call_type.upper(), "source": data.source.upper(),
            "duration_seconds": data.duration_seconds, "timestamp": timestamp,
            "has_recording": False, "summary": summary, "notes": summary,
            "createdAt": now}
    if existing:
        call["_id"] = existing["_id"]
        db.mobile_calls.update_one({"_id": existing["_id"]}, {"$set": call})
    else:
        call["_id"] = db.mobile_calls.insert_one(call).inserted_id

    if lead and not existing:
        timeline = {"text": f"CallPilot {data.call_type.lower()} call · {data.duration_seconds}s" +
                    (f" · {summary}" if summary else ""),
                    "outcome": data.call_type.lower(), "createdAt": timestamp}
        update = {"$inc": {"callCount": 1}, "$set": {"lastCalledAt": timestamp, "updatedAt": now},
                  "$push": {"notes": timeline}}
        if data.follow_up_date:
            update["$set"]["followUpDate"] = data.follow_up_date
            update["$set"]["status"] = "callback"
        db.leads.update_one({"_id": lead["_id"], "userId": user_id}, update)
    return {**_json(call), "id": str(call["_id"])}


@router.patch("/calls/{call_id}")
def update_call(call_id: str, data: CallBody, user=Depends(current_user)):
    query = {"userId": str(user["_id"]), "client_call_id": call_id}
    update = {"contact_name": data.contact_name, "phone_number": data.phone_number,
              "call_type": data.call_type.upper(), "source": data.source.upper(),
              "duration_seconds": data.duration_seconds, "summary": data.summary or data.notes or ""}
    result = _db().mobile_calls.update_one(query, {"$set": update})
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Call not found")
    call = _db().mobile_calls.find_one(query)
    return {**_json(call), "id": str(call["_id"]), "contact_id": call.get("leadId")}


@router.get("/notes")
def list_notes(user=Depends(current_user)):
    items = _db().mobile_notes.find({"userId": str(user["_id"])}).sort("updated_at", -1).limit(1000)
    return [{**_json(item), "id": str(item["_id"])} for item in items]


@router.post("/notes", status_code=201)
def create_note(data: NoteBody, user=Depends(current_user)):
    now = datetime.now(timezone.utc)
    item = {**data.model_dump(), "userId": str(user["_id"]), "created_at": now, "updated_at": now}
    item["_id"] = _db().mobile_notes.insert_one(item).inserted_id
    if data.contact_id and ObjectId.is_valid(data.contact_id):
        _db().leads.update_one(
            {"_id": ObjectId(data.contact_id), "userId": str(user["_id"])},
            {"$push": {"notes": {"text": f"{data.title}: {data.content}", "outcome": "note", "createdAt": now}},
             "$set": {"updatedAt": now}})
    return {**_json(item), "id": str(item["_id"])}


@router.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: str, user=Depends(current_user)):
    if not ObjectId.is_valid(note_id) or not _db().mobile_notes.delete_one(
        {"_id": ObjectId(note_id), "userId": str(user["_id"])}
    ).deleted_count:
        raise HTTPException(status_code=404, detail="Note not found")


@router.get("/reminders")
def list_reminders(user=Depends(current_user)):
    items = _db().mobile_reminders.find({"userId": str(user["_id"])}).sort("due_date_time", 1).limit(1000)
    return [{**_json(item), "id": str(item["_id"])} for item in items]


@router.post("/reminders", status_code=201)
def create_reminder(data: ReminderBody, user=Depends(current_user)):
    now = datetime.now(timezone.utc)
    item = {**data.model_dump(), "userId": str(user["_id"]), "status": "PENDING",
            "is_auto_created": False, "snooze_count": 0, "created_at": now}
    item["_id"] = _db().mobile_reminders.insert_one(item).inserted_id
    if data.contact_id and ObjectId.is_valid(data.contact_id):
        _db().leads.update_one({"_id": ObjectId(data.contact_id), "userId": str(user["_id"])},
                               {"$set": {"followUpDate": data.due_date_time, "status": "callback"}})
    return {**_json(item), "id": str(item["_id"])}


@router.put("/reminders/{reminder_id}/complete")
def complete_reminder(reminder_id: str, user=Depends(current_user)):
    if not ObjectId.is_valid(reminder_id):
        raise HTTPException(status_code=404, detail="Reminder not found")
    result = _db().mobile_reminders.update_one(
        {"_id": ObjectId(reminder_id), "userId": str(user["_id"])},
        {"$set": {"status": "COMPLETED", "completed_at": datetime.now(timezone.utc)}})
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Reminder not found")
    item = _db().mobile_reminders.find_one({"_id": ObjectId(reminder_id)})
    return {**_json(item), "id": reminder_id}


@router.delete("/reminders/{reminder_id}", status_code=204)
def delete_reminder(reminder_id: str, user=Depends(current_user)):
    if not ObjectId.is_valid(reminder_id) or not _db().mobile_reminders.delete_one(
        {"_id": ObjectId(reminder_id), "userId": str(user["_id"])}
    ).deleted_count:
        raise HTTPException(status_code=404, detail="Reminder not found")


@router.get("/analytics/summary")
def analytics_summary(user=Depends(current_user)):
    db = _db()
    user_id = str(user["_id"])
    calls = list(db.mobile_calls.find({"userId": user_id}, {"duration_seconds": 1, "timestamp": 1}).limit(5000))
    reminders = list(db.mobile_reminders.find({"userId": user_id}, {"status": 1}).limit(5000))
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=now.weekday())
    return {
        "total_calls": len(calls),
        "total_duration_minutes": sum(call.get("duration_seconds", 0) for call in calls) // 60,
        "calls_this_week": sum(1 for call in calls if call.get("timestamp") and call["timestamp"].replace(tzinfo=timezone.utc) >= week_start),
        "reminders_pending": sum(1 for reminder in reminders if reminder.get("status") == "PENDING"),
        "completed_reminders": sum(1 for reminder in reminders if reminder.get("status") == "COMPLETED"),
        "high_interest_leads": db.leads.count_documents({"userId": user_id, "type": "crm", "status": "interested"}),
        "sentiment_breakdown": {}, "call_frequency_by_day": {}
    }


@router.post("/ai/transcribe")
async def transcribe_audio(audio: UploadFile = File(...), language: str = Form("en"),
                           call_id: str = Form(""), user=Depends(current_user)):
    contents = await audio.read()
    if len(contents) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="Audio file is too large")
    suffix = os.path.splitext(audio.filename or "recording.m4a")[1] or ".m4a"
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as temp:
            temp.write(contents)
            temp_path = temp.name
        result = await get_ai_provider().transcribe(temp_path, language)
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    segments = [{"id": str(index), "speaker": item.get("speaker_label", "Speaker"),
                 "text": item.get("text", ""), "start_time": item.get("start_time_ms", 0) / 1000,
                 "end_time": item.get("end_time_ms", 0) / 1000}
                for index, item in enumerate(result.get("segments", []))]
    if call_id:
        _db().mobile_calls.update_one(
            {"userId": str(user["_id"]), "client_call_id": call_id},
            {"$set": {"transcript": result.get("full_text", ""), "transcript_segments": segments}})
    return {"call_id": call_id, "full_text": result.get("full_text", ""),
            "language": result.get("language", language), "confidence_score": result.get("confidence_score") or 0.0,
            "segments": segments}


@router.post("/ai/recap")
async def generate_recap(data: dict, user=Depends(current_user)):
    transcript = str(data.get("transcript_text", ""))
    if not transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript text is required")
    result = await get_ai_provider().summarize(transcript)
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    score = result.get("sentiment_score") or 0.0
    interest = result.get("interest_level", "unknown")
    label = "Positive" if score >= 0.65 else "Negative" if score <= 0.35 else "Neutral"
    actions = [{"id": str(index), "task": item.get("title", ""), "assignee": item.get("assignee"),
                "deadline": item.get("deadline"), "priority": str(item.get("priority", "medium")).upper()}
               for index, item in enumerate(result.get("actions", []))]
    call_id = data.get("call_id", "")
    response = {"call_id": call_id, "quick_recap": result.get("summary_text", ""),
                "key_points": result.get("next_steps", []),
                "client_commitments": result.get("client_commitments", []),
                "user_commitments": result.get("user_commitments", []),
                "suggested_follow_up_date": result.get("suggested_follow_up_date"),
                "sentiment_score": score, "sentiment_label": label,
                "client_interest_level": interest, "generated_follow_up_message": result.get("follow_up_message"),
                "action_items": actions}
    if call_id:
        db = _db()
        query = {"userId": str(user["_id"]), "client_call_id": call_id}
        saved = db.mobile_calls.find_one(query)
        db.mobile_calls.update_one(query, {"$set": {"summary": response["quick_recap"],
                                    "key_points": response["key_points"],
                                    "action_items": [item["task"] for item in actions],
                                    "sentiment": label, "client_interest_level": interest,
                                    "follow_up_message": response["generated_follow_up_message"]}})
        if saved and saved.get("leadId"):
            db.leads.update_one({"_id": ObjectId(saved["leadId"]), "userId": str(user["_id"])},
                                {"$push": {"notes": {"text": f"Call recap: {response['quick_recap']}",
                                                         "outcome": "call_recap", "createdAt": datetime.now(timezone.utc)}}})
    return response


@router.post("/ai/follow-up")
async def generate_follow_up(data: dict, user=Depends(current_user)):
    call = _db().mobile_calls.find_one({"userId": str(user["_id"]),
                                        "$or": [{"client_call_id": data.get("call_id")},
                                                {"_id": ObjectId(data["call_id"])} if ObjectId.is_valid(data.get("call_id", "")) else {"_id": None}]})
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    result = await get_ai_provider().generate_follow_up({
        "contact_name": call.get("contact_name"), "company": "",
        "last_summary": call.get("summary", ""), "transcript": call.get("transcript", ""),
        "tone": data.get("tone", "professional")})
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return {"message": result.get("message", "")}


@router.post("/ai/assistant")
async def assistant(data: dict, user=Depends(current_user)):
    reply = await get_ai_provider().chat(str(data.get("message", "")), str(data.get("conversation_context", "")))
    return {"reply": reply, "suggested_actions": []}
