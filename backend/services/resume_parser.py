import json
from typing import List, Optional
from pydantic import BaseModel, Field
import openai
from config import get_settings

settings = get_settings()
client = openai.AsyncClient(api_key=settings.openai_api_key)

class Project(BaseModel):
    name: str = Field(description="Name of the project")
    tech_stack: List[str] = Field(description="List of technologies used in the project")
    claimed_contribution: str = Field(description="What the candidate specifically did (not the team)")
    claimed_metrics: List[str] = Field(description="Quantifiable metrics claimed, e.g. 'reduced latency 7s to 600ms'")
    verifiable: bool = Field(description="False if the claims are vague or unquantified")

class Company(BaseModel):
    name: str = Field(description="Name of the company")
    role: str = Field(description="Role held at the company")
    duration: str = Field(description="Duration of employment")

class StructuredResume(BaseModel):
    candidate_name: str = Field(description="Candidate's full name")
    projects: List[Project] = Field(default_factory=list)
    skills_listed: List[str] = Field(description="All skills listed anywhere on the resume")
    skills_with_evidence: List[str] = Field(description="Subset of skills_listed that appear in a project description or job duty")
    companies: List[Company] = Field(default_factory=list)
    education: List[str] = Field(default_factory=list)
    red_flags: List[str] = Field(description="Gaps in timeline, generic buzzword-only bullets, etc.")
    
    # Gap analysis fields
    role_required_skills: List[str] = Field(description="Skills required for the target role")
    covered_with_evidence: List[str] = Field(description="Intersection of role_required_skills and skills_with_evidence")
    listed_but_unevidenced: List[str] = Field(description="Skills required and listed, but lack evidence in projects")
    missing_entirely: List[str] = Field(description="Required skills that are not on the resume at all")


async def parse_resume_to_json(resume_text: str, role_title: str) -> Optional[dict]:
    """
    Parses raw resume text into a structured JSON dictionary focusing on projects, 
    metrics, and a gap analysis against the target role.
    """
    if not resume_text or not resume_text.strip():
        return None
        
    prompt = f"""You are an expert technical recruiter and interviewer.
Your task is to parse the provided raw resume text and extract its contents into a structured JSON format.

Additionally, you must perform a gap analysis against the target role: "{role_title}".
Based on this role, determine the typical `role_required_skills`.
Then, compare the candidate's `skills_with_evidence` and `skills_listed` against the `role_required_skills` to populate `covered_with_evidence`, `listed_but_unevidenced`, and `missing_entirely`.

Raw Resume Text:
<resume>
{resume_text}
</resume>
"""

    try:
        response = await client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format=StructuredResume,
            temperature=0.1
        )
        return response.choices[0].message.parsed.model_dump()
    except Exception as e:
        print(f"Error parsing resume: {e}")
        return None
