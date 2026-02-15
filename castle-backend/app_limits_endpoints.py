

# ============================================
# APP LIMITS ENDPOINTS
# ============================================

class AppLimitRequest(BaseModel):
    app_name: str
    limit_minutes: int


@app.post("/groups/{group_id}/app-limits")
def create_app_limit(group_id: str, req: AppLimitRequest):
    """
    Create or update an app time limit for a group.
    """
    # Verify group exists
    group = get_group(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    result = create_or_update_app_limit(
        group_id=group_id,
        app_name=req.app_name,
        limit_minutes=req.limit_minutes
    )
    
    return {
        "app_name": req.app_name,
        "limit_minutes": req.limit_minutes,
        "message": "App limit created/updated successfully"
    }


@app.get("/groups/{group_id}/app-limits")
def get_group_app_limits(group_id: str):
    """
    Get all app limits for a group.
    """
    # Verify group exists
    group = get_group(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    limits = get_app_limits(group_id)
    
    return {
        "group_id": group_id,
        "app_limits": limits
    }


@app.delete("/groups/{group_id}/app-limits/{app_name}")
def delete_group_app_limit(group_id: str, app_name: str):
    """
    Delete an app limit for a group.
    """
    # Verify group exists
    group = get_group(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    delete_app_limit(group_id, app_name)
    
    return {
        "message": f"App limit for '{app_name}' deleted successfully"
    }


@app.get("/groups/{group_id}/app-usage")
def get_group_app_usage(group_id: str, date: str = Query(None)):
    """
    Get current usage for all apps with limits set.
    Returns usage data including whether limits are exceeded.
    """
    # Verify group exists
    group = get_group(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Use today if no date specified
    log_date = date or date_type.today().isoformat()
    
    usage_data = get_all_app_usage(group_id, log_date)
    
    return {
        "group_id": group_id,
        "date": log_date,
        "app_usage": usage_data
    }
