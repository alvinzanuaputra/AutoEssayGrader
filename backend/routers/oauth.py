from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.db import get_session
from models.user_model import User, UserOAuth, UserSession
from core.auth import get_jwt_strategy
from typing import Optional
import httpx
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

router = APIRouter()

# OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# OAuth URLs
GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_INFO_URL = "https://api.github.com/user"
GITHUB_USER_EMAIL_URL = "https://api.github.com/user/emails"


@router.get("/oauth/google")
async def oauth_google_login():
    """Endpoint untuk memulai OAuth flow dengan Google"""
    redirect_uri = f"http://localhost:8000/api/auth/oauth/google/callback"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    authorization_url = f"{GOOGLE_AUTHORIZE_URL}?{query_string}"
    
    return {"authorization_url": authorization_url}


@router.get("/oauth/google/callback")
async def oauth_google_callback(code: str, request: Request):
    """Callback endpoint untuk Google OAuth"""
    async for session in get_session():
        pass
    
    # Exchange authorization code for access token
    redirect_uri = f"http://localhost:8000/api/auth/oauth/google/callback"
    
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            },
        )
        
        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get access token")
        
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        
        # Get user info from Google
        user_info_response = await client.get(
            GOOGLE_USER_INFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        
        if user_info_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        user_info = user_info_response.json()
    
    # Check if user exists
    oauth_id = user_info.get("id")
    email = user_info.get("email")
    name = user_info.get("name", "")
    picture = user_info.get("picture")
    
    print(f"📸 Google OAuth - User info:")
    print(f"   - OAuth ID: {oauth_id}")
    print(f"   - Email: {email}")
    print(f"   - Name: {name}")
    print(f"   - Profile Picture: {picture}")
    
    # Check existing OAuth account
    result = await session.execute(
        select(UserOAuth).where(
            UserOAuth.oauth_provider == "google",
            UserOAuth.oauth_id == oauth_id
        )
    )
    oauth_account = result.scalar_one_or_none()
    
    if oauth_account:
        # User exists, update tokens and profile picture
        oauth_account.access_token = access_token
        oauth_account.refresh_token = refresh_token
        
        # Update user's profile picture from Google
        user = await session.get(User, oauth_account.user_id)
        if user:
            print(f"✅ Updating existing user (ID: {user.id})")
            print(f"   - Old picture: {user.profile_picture}")
            print(f"   - New picture: {picture}")
            user.profile_picture = picture  # Update photo from Google
            user.fullname = name  # Also update name in case it changed
        
        await session.commit()
    else:
        # Check if user exists by email
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            # Create new user
            username = email.split("@")[0] + "_" + oauth_id[:6]
            print(f"🆕 Creating new user:")
            print(f"   - Username: {username}")
            print(f"   - Email: {email}")
            print(f"   - Name: {name}")
            print(f"   - Profile Picture: {picture}")
            
            user = User(
                email=email,
                fullname=name,
                username=username,
                profile_picture=picture,
                hashed_password="",  # No password for OAuth users
                is_active=True,
                is_verified=True,
            )
            session.add(user)
            await session.flush()
            print(f"✅ User created with ID: {user.id}")
        
        # Create OAuth account
        oauth_account = UserOAuth(
            user_id=user.id,
            oauth_provider="google",
            oauth_id=oauth_id,
            access_token=access_token,
            refresh_token=refresh_token,
        )
        session.add(oauth_account)
        await session.commit()
    
    # Generate JWT token
    jwt_strategy = get_jwt_strategy()
    token = await jwt_strategy.write_token(user)
    
    # Create session record for tracking (1 hour)
    login_timestamp = datetime.utcnow()
    expires_at = login_timestamp + timedelta(hours=1)
    client_host = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")
    
    new_session = UserSession(
        user_id=user.id,
        token=token,
        login_timestamp=login_timestamp,
        last_activity=login_timestamp,
        ip_address=client_host,
        user_agent=user_agent,
        is_active=True,
        expires_at=expires_at
    )
    session.add(new_session)
    await session.commit()
    
    # Redirect to frontend with token
    return RedirectResponse(url=f"{FRONTEND_URL}/pages/home?token={token}")


@router.get("/oauth/github")
async def oauth_github_login():
    """Endpoint untuk memulai OAuth flow dengan GitHub"""
    redirect_uri = f"http://localhost:8000/api/auth/oauth/github/callback"
    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "scope": "read:user user:email",
    }
    
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    authorization_url = f"{GITHUB_AUTHORIZE_URL}?{query_string}"
    
    return {"authorization_url": authorization_url}


@router.get("/oauth/github/callback")
async def oauth_github_callback(code: str, request: Request):
    """Callback endpoint untuk GitHub OAuth"""
    try:
        async for session in get_session():
            async with httpx.AsyncClient() as client:
                token_response = await client.post(
                    GITHUB_TOKEN_URL,
                    data={
                        "client_id": GITHUB_CLIENT_ID,
                        "client_secret": GITHUB_CLIENT_SECRET,
                        "code": code,
                    },
                    headers={"Accept": "application/json"},
                )
                
                print(f"GitHub token response status: {token_response.status_code}")
                print(f"GitHub token response body: {token_response.text}")
                
                if token_response.status_code != 200:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Failed to get access token: {token_response.text}"
                    )
                
                token_data = token_response.json()
                access_token = token_data.get("access_token")
                
                if not access_token:
                    raise HTTPException(
                        status_code=400,
                        detail=f"No access token in response: {token_data}"
                    )
                
                # Get user info from GitHub
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json",
                }
                
                user_info_response = await client.get(GITHUB_USER_INFO_URL, headers=headers)
                print(f"GitHub user info status: {user_info_response.status_code}")
                print(f"GitHub user info body: {user_info_response.text}")
                
                if user_info_response.status_code != 200:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Failed to get user info: {user_info_response.text}"
                    )
                
                user_info = user_info_response.json()
                
                # Get user emails
                email_response = await client.get(GITHUB_USER_EMAIL_URL, headers=headers)
                if email_response.status_code == 200:
                    emails = email_response.json()
                    primary_email = next((e["email"] for e in emails if e["primary"]), None)
                else:
                    primary_email = user_info.get("email")
            
            # Extract user data
            oauth_id = str(user_info.get("id"))
            email = primary_email or f"github_{oauth_id}@placeholder.com"
            name = user_info.get("name") or user_info.get("login", "")
            avatar = user_info.get("avatar_url")
            
            print(f"📸 GitHub OAuth - User info:")
            print(f"   - OAuth ID: {oauth_id}")
            print(f"   - Email: {email}")
            print(f"   - Name: {name}")
            print(f"   - Avatar URL: {avatar}")
            
            # Check existing OAuth account
            result = await session.execute(
                select(UserOAuth).where(
                    UserOAuth.oauth_provider == "github",
                    UserOAuth.oauth_id == oauth_id
                )
            )
            oauth_account = result.scalar_one_or_none()
            
            if oauth_account:
                # User exists, update token and profile picture
                oauth_account.access_token = access_token
                
                # Update user's profile picture and name from GitHub
                user = await session.get(User, oauth_account.user_id)
                if user:
                    print(f"✅ Updating existing GitHub user (ID: {user.id})")
                    print(f"   - Old avatar: {user.profile_picture}")
                    print(f"   - New avatar: {avatar}")
                    user.profile_picture = avatar  # Update avatar from GitHub
                    user.fullname = name  # Also update name in case it changed
                
                await session.commit()
            else:
                # Check if user exists by email
                result = await session.execute(select(User).where(User.email == email))
                user = result.scalar_one_or_none()
                
                if not user:
                    # Create new user
                    username = user_info.get("login", "github_" + oauth_id[:6])
                    print(f"🆕 Creating new GitHub user:")
                    print(f"   - Username: {username}")
                    print(f"   - Email: {email}")
                    print(f"   - Name: {name}")
                    print(f"   - Avatar: {avatar}")
                    
                    user = User(
                        email=email,
                        fullname=name,
                        username=username,
                        profile_picture=avatar,
                        hashed_password="",  # No password for OAuth users
                        is_active=True,
                        is_verified=True,
                    )
                    session.add(user)
                    await session.flush()
                    print(f"✅ GitHub user created with ID: {user.id}")
                
                # Create OAuth account
                oauth_account = UserOAuth(
                    user_id=user.id,
                    oauth_provider="github",
                    oauth_id=oauth_id,
                    access_token=access_token,
                    refresh_token=None,
                )
                session.add(oauth_account)
                await session.commit()
            
            # Generate JWT token
            jwt_strategy = get_jwt_strategy()
            token = await jwt_strategy.write_token(user)
            
            # Create session record for tracking (1 hour)
            login_timestamp = datetime.utcnow()
            expires_at = login_timestamp + timedelta(hours=1)
            client_host = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent", "")
            
            new_session = UserSession(
                user_id=user.id,
                token=token,
                login_timestamp=login_timestamp,
                last_activity=login_timestamp,
                ip_address=client_host,
                user_agent=user_agent,
                is_active=True,
                expires_at=expires_at
            )
            session.add(new_session)
            await session.commit()
            
            # Redirect to frontend with token
            return RedirectResponse(url=f"{FRONTEND_URL}/pages/home?token={token}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"GitHub OAuth error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during GitHub OAuth: {str(e)}"
        )