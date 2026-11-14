"""Compatibility proxy for legacy CallPilot API service URLs.

The canonical API is callpilot-api-main. This service forwards requests to it,
preserving HTTP methods, query strings, authorization headers, and streamed
request/response bodies. It does not connect to a second database.
"""
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse
from starlette.background import BackgroundTask

CANONICAL_API = "https://callpilot-api-main.onrender.com"
HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
}
TIMEOUT = httpx.Timeout(connect=15.0, read=180.0, write=180.0, pool=15.0)
client = httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=False)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await client.aclose()


app = FastAPI(
    title="CallPilot API Compatibility Gateway",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/")
async def root():
    return {
        "service": "CallPilot compatibility gateway",
        "status": "forwarding",
        "canonical_api": CANONICAL_API,
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "role": "legacy-api-forwarder"}


@app.api_route(
    "/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
)
async def forward(path: str, request: Request):
    target_url = f"{CANONICAL_API}/{path}"
    if request.url.query:
        target_url = f"{target_url}?{request.url.query}"

    headers = {
        name: value
        for name, value in request.headers.items()
        if name.lower() not in HOP_BY_HOP_HEADERS
    }

    try:
        outbound = client.build_request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=request.stream(),
        )
        upstream = await client.send(outbound, stream=True)
    except httpx.RequestError:
        return JSONResponse(
            status_code=502,
            content={"detail": "Canonical CallPilot API is temporarily unavailable"},
        )

    response_headers = {
        name: value
        for name, value in upstream.headers.items()
        if name.lower() not in HOP_BY_HOP_HEADERS
    }

    return StreamingResponse(
        upstream.aiter_raw(),
        status_code=upstream.status_code,
        headers=response_headers,
        background=BackgroundTask(upstream.aclose),
    )
