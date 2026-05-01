from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentResponse
# from app.core.auth import get_current_user_id (unused)

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("/", response_model=List[DepartmentResponse])
async def list_departments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Department))
    return result.scalars().all()

import string
import random

def generate_invite_code(length=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@router.post("/", response_model=DepartmentResponse)
async def create_department(dept: DepartmentCreate, db: AsyncSession = Depends(get_db)):
    db_dept = Department(**dept.model_dump())
    db_dept.invite_code = generate_invite_code()
    db.add(db_dept)
    await db.commit()
    await db.refresh(db_dept)
    return db_dept

@router.delete("/{dept_id}")
async def delete_department(dept_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Department).where(Department.id == dept_id))
    db_dept = result.scalars().first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")
    await db.delete(db_dept)
    await db.commit()
    return {"message": "Department deleted"}
