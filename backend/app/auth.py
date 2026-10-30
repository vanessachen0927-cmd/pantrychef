from fastapi import Header, HTTPException
from jwt import PyJWKClient, decode, InvalidTokenError
from .config import settings

_jwks = None

def require_user(authorization: str | None = Header(default=None)) -> str:
    global _jwks
    if not settings.supabase_url:
        raise HTTPException(503, "Configure SUPABASE_URL to enable user accounts")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Sign in required")
    token = authorization[7:]
    try:
        if _jwks is None:
            _jwks = PyJWKClient(settings.supabase_url.rstrip("/") + "/auth/v1/.well-known/jwks.json")
        key = _jwks.get_signing_key_from_jwt(token)
        payload = decode(token, key.key, algorithms=["RS256", "ES256"], audience="authenticated", options={"require": ["exp", "sub", "aud"]})
        return payload["sub"]
    except (InvalidTokenError, Exception) as exc:
        raise HTTPException(401, "Invalid session token") from exc
