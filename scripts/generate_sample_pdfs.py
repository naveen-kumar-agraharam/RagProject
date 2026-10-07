"""
Script to generate sample college PDF documents for testing CollegeGPT.
Produces realistic PDF files with proper styling and structure.
"""

import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak


def create_placement_rules(output_path: Path):
    doc = SimpleDocTemplate(str(output_path), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=20, leading=24, textColor=colors.HexColor('#1e3a8a'))
    h2_style = ParagraphStyle('DocH2', parent=styles['Heading2'], fontSize=14, leading=18, textColor=colors.HexColor('#1e40af'))
    body_style = ParagraphStyle('DocBody', parent=styles['Normal'], fontSize=10, leading=14, textColor=colors.HexColor('#334155'))
    bullet_style = ParagraphStyle('DocBullet', parent=body_style, leftIndent=20)
    
    elements = []
    
    # Title
    elements.append(Paragraph("University Training and Placement Cell", title_style))
    elements.append(Paragraph("<b>Campus Placement Policy and Guidelines (2024-2025)</b>", h2_style))
    elements.append(Spacer(1, 14))
    
    # Section 1
    elements.append(Paragraph("1. Eligibility Criteria for Campus Drives", h2_style))
    elements.append(Paragraph("To participate in on-campus placement drives, undergraduate students must meet the following baseline criteria:", body_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>CGPA Requirement:</b> Minimum CGPA of 7.5 throughout the degree (no rounding up).", bullet_style))
    elements.append(Paragraph("• <b>Active Backlogs:</b> Zero active backlogs at the time of company registration. Any history of cleared backlogs must be declared truthfully.", bullet_style))
    elements.append(Paragraph("• <b>Disciplinary Clearance:</b> Student must have no pending disciplinary inquiries or misconduct flags from the Proctorial Board.", bullet_style))
    elements.append(Paragraph("• <b>Attendance:</b> Minimum 80% attendance in placement preparatory classes and mock interviews.", bullet_style))
    elements.append(Spacer(1, 12))
    
    # Section 2
    elements.append(Paragraph("2. Company Categorization and Salary Tiers", h2_style))
    elements.append(Paragraph("Companies visiting campus are classified into three distinct tiers based on CTC offered:", body_style))
    elements.append(Spacer(1, 6))
    
    tier_data = [
        ["Category", "CTC Range (LPA)", "Policy Rule"],
        ["Tier 1 (Dream / Marquee)", ">= 14.0 LPA", "Open to all eligible students; one Dream upgrade permitted."],
        ["Tier 2 (Core / Super)", "7.0 to 13.9 LPA", "Standard offer; student eligible for Tier 1 drive if offered Tier 2."],
        ["Tier 3 (Mass / Standard)", "< 7.0 LPA", "Single offer policy applies; eligible for Dream drive upgrade."]
    ]
    t = Table(tier_data, colWidths=[140, 100, 260])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e3a8a')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f8fafc')),
        ('FONTSIZE', (0,0), (-1,-1), 9),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 14))
    
    # Page break for realistic multi-page test
    elements.append(PageBreak())
    
    # Page 2
    elements.append(Paragraph("3. Dream Offer and Upgrade Policy", h2_style))
    elements.append(Paragraph("A student securing an offer in Tier 3 or Tier 2 is allowed exactly ONE upgrade attempt under the Dream Offer policy:", body_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• If a student secures an offer with CTC < 8 LPA, they are eligible to appear for Tier 1 companies offering 15 LPA or higher.", bullet_style))
    elements.append(Paragraph("• Once a student receives a Dream offer (Tier 1), their participation in further campus placement drives is strictly terminated to ensure equal opportunity.", bullet_style))
    elements.append(Spacer(1, 12))
    
    # Section 4
    elements.append(Paragraph("4. Attendance and Code of Conduct", h2_style))
    elements.append(Paragraph("• Attendance in Pre-Placement Talks (PPT) is mandatory (100%) for all registered candidates.", bullet_style))
    elements.append(Paragraph("• <b>Blacklist Penalty:</b> If a candidate registers for a drive but absents themselves from the test or interview without 24 hours prior medical justification, they will be debarred from the next 2 consecutive campus recruitment drives.", bullet_style))
    elements.append(Paragraph("• Formal attire is strictly enforced: Navy blue or black blazer, white shirt, and formal leather shoes.", bullet_style))
    elements.append(Spacer(1, 14))
    
    elements.append(Paragraph("5. Contact and Placement Cell Desk", h2_style))
    elements.append(Paragraph("Email: placements@university.edu | Desk: Room 104, Admin Block | Office Hours: 9:00 AM - 5:00 PM (Mon-Fri)", body_style))
    
    doc.build(elements)


def create_academic_regulations(output_path: Path):
    doc = SimpleDocTemplate(str(output_path), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=20, leading=24, textColor=colors.HexColor('#065f46'))
    h2_style = ParagraphStyle('DocH2', parent=styles['Heading2'], fontSize=14, leading=18, textColor=colors.HexColor('#047857'))
    body_style = ParagraphStyle('DocBody', parent=styles['Normal'], fontSize=10, leading=14, textColor=colors.HexColor('#334155'))
    bullet_style = ParagraphStyle('DocBullet', parent=body_style, leftIndent=20)
    
    elements = []
    
    elements.append(Paragraph("Office of the Dean of Academic Affairs", title_style))
    elements.append(Paragraph("<b>Undergraduate Academic Regulations & Examination Rules</b>", h2_style))
    elements.append(Spacer(1, 14))
    
    elements.append(Paragraph("1. Attendance Requirements and Condonation", h2_style))
    elements.append(Paragraph("Regular attendance in all scheduled lectures, tutorials, and practicals is compulsory:", body_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>Standard Attendance:</b> A student must maintain a minimum attendance of 75% in each enrolled course to be eligible for end-semester examinations.", bullet_style))
    elements.append(Paragraph("• <b>Medical Condonation:</b> In exceptional cases of certified medical illness or hospitalization, attendance between 65% and 75% may be condoned by the Dean of Academic Affairs upon submission of genuine medical certificates and paying a condonation fee of Rs. 1,000 per subject.", bullet_style))
    elements.append(Paragraph("• <b>Debarred Status:</b> Any student with attendance below 65% is summarily debarred from sitting for the end-semester exam in that course and must repeat the course during summer semester.", bullet_style))
    elements.append(Spacer(1, 12))
    
    elements.append(Paragraph("2. 10-Point Absolute Grading System", h2_style))
    elements.append(Paragraph("Academic performance is evaluated using the following grade distribution:", body_style))
    elements.append(Spacer(1, 6))
    
    grade_data = [
        ["Grade", "Marks Range", "Grade Point", "Description"],
        ["O", "90 - 100", "10", "Outstanding"],
        ["A+", "80 - 89", "9", "Excellent"],
        ["A", "70 - 79", "8", "Very Good"],
        ["B+", "60 - 69", "7", "Good"],
        ["B", "55 - 59", "6", "Above Average"],
        ["C", "50 - 54", "5", "Pass"],
        ["F", "Below 50", "0", "Fail (Requires Re-examination)"]
    ]
    t = Table(grade_data, colWidths=[60, 100, 90, 240])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#065f46')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f0fdf4')),
        ('FONTSIZE', (0,0), (-1,-1), 9),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 14))
    
    elements.append(PageBreak())
    
    elements.append(Paragraph("3. Re-evaluation and Answer Script Verification", h2_style))
    elements.append(Paragraph("Students dissatisfied with their end-semester examination marks may apply for re-evaluation:", body_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• Application must be submitted within 10 calendar days of official grade publication on the student portal.", bullet_style))
    elements.append(Paragraph("• A non-refundable re-evaluation fee of Rs. 500 per theoretical paper applies.", bullet_style))
    elements.append(Paragraph("• If the revised score changes by more than 15%, the script is re-examined by a third external evaluator.", bullet_style))
    elements.append(Spacer(1, 12))
    
    elements.append(Paragraph("4. Degree Duration Limits", h2_style))
    elements.append(Paragraph("• The maximum permitted duration to complete the 4-year B.Tech program is 6 academic years (12 semesters). Failure to clear all requirements within 6 years will lead to cancellation of registration.", bullet_style))
    
    doc.build(elements)


def create_syllabus_document(output_path: Path):
    doc = SimpleDocTemplate(str(output_path), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=20, leading=24, textColor=colors.HexColor('#7c2d12'))
    h2_style = ParagraphStyle('DocH2', parent=styles['Heading2'], fontSize=14, leading=18, textColor=colors.HexColor('#9a3412'))
    body_style = ParagraphStyle('DocBody', parent=styles['Normal'], fontSize=10, leading=14, textColor=colors.HexColor('#334155'))
    bullet_style = ParagraphStyle('DocBullet', parent=body_style, leftIndent=20)
    
    elements = []
    
    elements.append(Paragraph("Department of Computer Science & Engineering", title_style))
    elements.append(Paragraph("<b>B.Tech Semester V Course Syllabus & Lab Manual Guide</b>", h2_style))
    elements.append(Spacer(1, 14))
    
    elements.append(Paragraph("Course 1: CS502 - Database Management Systems (4 Credits)", h2_style))
    elements.append(Paragraph("<b>Course Objectives:</b> Understand relational database design, query optimization, indexing, and transaction management.", body_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>Unit 1 - Relational Model:</b> Relational algebra, tuple relational calculus, integrity constraints.", bullet_style))
    elements.append(Paragraph("• <b>Unit 2 - SQL and Query Processing:</b> Complex queries, nested subqueries, views, triggers, and cost-based query optimization.", bullet_style))
    elements.append(Paragraph("• <b>Unit 3 - Normalization:</b> Functional dependencies, 1NF, 2NF, 3NF, BCNF, lossless join decomposition.", bullet_style))
    elements.append(Paragraph("• <b>Unit 4 - Transactions & Concurrency:</b> ACID properties, serializability, two-phase locking (2PL), deadlock prevention.", bullet_style))
    elements.append(Paragraph("• <b>Unit 5 - Storage & Indexing:</b> B-Trees, B+ Trees, hashing techniques.", bullet_style))
    elements.append(Paragraph("• <b>Prescribed Textbook:</b> <i>Database System Concepts</i> by Silberschatz, Korth, and Sudarshan, 7th Edition, McGraw-Hill.", bullet_style))
    elements.append(Spacer(1, 14))
    
    elements.append(PageBreak())
    
    elements.append(Paragraph("Course 2: CS503 - Operating Systems (4 Credits)", h2_style))
    elements.append(Paragraph("<b>Key Topics:</b>", body_style))
    elements.append(Paragraph("• Process scheduling (FCFS, SJF, Round Robin, Multilevel Feedback Queue).", bullet_style))
    elements.append(Paragraph("• Synchronization: Critical section problem, Peterson algorithm, semaphores, mutexes, dining philosophers problem.", bullet_style))
    elements.append(Paragraph("• Deadlocks: Resource allocation graph, Banker's algorithm for deadlock avoidance.", bullet_style))
    elements.append(Paragraph("• Memory Management: Paging, segmentation, page replacement algorithms (FIFO, LRU, Optimal).", bullet_style))
    elements.append(Spacer(1, 12))
    
    elements.append(Paragraph("Course 3: CS508 - Database & OS Practical Laboratory Rules", h2_style))
    elements.append(Paragraph("• <b>Lab Attendance:</b> Minimum 80% practical attendance is strictly enforced.", bullet_style))
    elements.append(Paragraph("• <b>Lab Records:</b> Completed lab notebooks with experiment results must be submitted every Monday by 10:00 AM.", bullet_style))
    elements.append(Paragraph("• <b>Evaluation Scheme:</b> Continuous assessment (40 marks), Internal Viva (20 marks), End-semester practical exam (40 marks).", bullet_style))
    
    doc.build(elements)


if __name__ == "__main__":
    out_dir = Path("sample_documents")
    out_dir.mkdir(exist_ok=True)
    
    create_placement_rules(out_dir / "Placement_Rules_2024.pdf")
    create_academic_regulations(out_dir / "Academic_Regulations.pdf")
    create_syllabus_document(out_dir / "Computer_Science_Syllabus.pdf")
    
    print("Successfully generated 3 sample college PDF documents in sample_documents/")
