from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from datetime import datetime


# Indian number formatting (₹ 1,00,000 style but using INR)
def format_inr(amount):
    amount = float(amount)
    s = f"{amount:,.2f}"
    parts = s.split(".")
    integer = parts[0].replace(",", "")
    
    if len(integer) > 3:
        last3 = integer[-3:]
        rest = integer[:-3]
        rest = ",".join([rest[max(i-2, 0):i] for i in range(len(rest), 0, -2)][::-1])
        integer = rest + "," + last3
    
    return f"INR {integer}.{parts[1]}"


def generate_offer_pdf(data, file_path):
    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=50,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Title'],
        fontSize=22,
        textColor=colors.HexColor("#1B2631"),
        spaceAfter=10,
        alignment=1  # center
    )

    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.grey,
        alignment=1,
        spaceAfter=20
    )

    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor("#154360"),
        spaceAfter=10
    )

    normal_style = ParagraphStyle(
        'NormalStyle',
        parent=styles['Normal'],
        fontSize=11,
        leading=16,
        spaceAfter=8
    )

    bold_style = ParagraphStyle(
        'BoldStyle',
        parent=styles['Normal'],
        fontSize=11,
        leading=16,
        spaceAfter=8,
        textColor=colors.black
    )

    footer_style = ParagraphStyle(
        'FooterStyle',
        parent=styles['Italic'],
        fontSize=9,
        alignment=1,
        textColor=colors.grey,
        spaceBefore=30
    )

    elements = []

    # Title
    elements.append(Paragraph("Loan Offer Letter", title_style))
    elements.append(Paragraph(
        f"Generated on {datetime.now().strftime('%d %B %Y')}",
        subtitle_style
    ))

    # Greeting
    elements.append(Paragraph(f"Dear <b>{data['name']}</b>,", normal_style))

    elements.append(Paragraph(
        "We are pleased to offer you a loan based on your eligibility and our internal evaluation. "
        "Please find the details of your loan offer below.",
        normal_style
    ))

    elements.append(Spacer(1, 10))

    # Section Header
    elements.append(Paragraph("Loan Details", header_style))

    # Table Data
    table_data = [
        ["Loan Amount", format_inr(data['amount'])],
        ["Interest Rate", f"{data['rate']} % per annum"],
        ["Tenure", f"{data['tenure']} months"],
        ["Monthly EMI", format_inr(data['emi'])],
        ["Total Payment", format_inr(data['total'])],
    ]

    table = Table(table_data, colWidths=[2.8 * inch, 3.2 * inch])

    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.whitesmoke),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.whitesmoke, colors.HexColor("#F8F9F9")]),

        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),

        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),

        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),

        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#EBF5FB")),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor("#1B4F72")),
    ]))

    elements.append(table)

    elements.append(Spacer(1, 20))

    # Info box style paragraph
    elements.append(Paragraph(
        "Please review the above details carefully. If you agree with the terms and conditions, "
        "you may proceed with acceptance of this loan offer.",
        normal_style
    ))

    elements.append(Spacer(1, 30))

    # Signature Section
    elements.append(Paragraph("Warm regards,", normal_style))
    elements.append(Paragraph("<b>TenzorX AI Loan System</b>", bold_style))

    # Footer
    elements.append(Paragraph(
        "This is a system-generated document and does not require a physical signature.",
        footer_style
    ))

    doc.build(elements)

    return file_path