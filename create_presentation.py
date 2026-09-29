"""
Create a professional 10-slide PowerPoint presentation about 'Умный Календарь'.
Uses python-pptx library.
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
import copy

# ─── Color palette ───────────────────────────────────────────────────────────
NAVY     = RGBColor(0x1E, 0x3A, 0x5F)   # #1E3A5F  dark navy (primary)
EMERALD  = RGBColor(0x10, 0xB9, 0x81)   # #10b981  accent
STEEL    = RGBColor(0x1C, 0x72, 0x93)   # #1C7293  steel blue
TEAL     = RGBColor(0x02, 0x80, 0x90)   # #028090
SLATE    = RGBColor(0x64, 0x74, 0x8B)   # #64748B
LIGHT    = RGBColor(0xF0, 0xF9, 0xF6)   # #F0F9F6
WHITE    = RGBColor(0xFF, 0xFF, 0xFF)
BG_WHITE = RGBColor(0xFF, 0xFF, 0xFF)

# ─── Helpers ─────────────────────────────────────────────────────────────────
def inches(n): return Inches(n)
def pt(n): return Pt(n)

def add_filled_shape(slide, left, top, width, height, fill_color, line_color=None):
    shape = slide.shapes.add_shape(
        1,  # MSO_SHAPE_TYPE.RECTANGLE = 1
        inches(left), inches(top), inches(width), inches(height)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if line_color:
        shape.line.color.rgb = line_color
        shape.line.width = Pt(1)
    else:
        shape.line.fill.background()
    return shape

def add_text_box(slide, text, left, top, width, height,
                 font_size=14, bold=False, italic=False,
                 color=None, align=PP_ALIGN.LEFT, font_face="Calibri",
                 word_wrap=True, margin_left=Inches(0.05), margin_top=Inches(0.05)):
    txBox = slide.shapes.add_textbox(
        inches(left), inches(top), inches(width), inches(height)
    )
    txBox.word_wrap = word_wrap
    tf = txBox.text_frame
    tf.word_wrap = word_wrap
    # Set internal margins
    tf.margin_left = margin_left
    tf.margin_top = margin_top
    tf.margin_right = Inches(0.05)
    tf.margin_bottom = Inches(0.02)

    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = pt(font_size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.name = font_face
    if color:
        run.font.color.rgb = color
    return txBox

def add_left_bar(slide, color=EMERALD, left=0, top=0, width=0.15, height=5.625):
    """Add left accent bar on content slides."""
    add_filled_shape(slide, left, top, width, height, color)

def set_slide_bg(slide, color):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_rich_paragraph(tf, texts_and_opts, clear=True):
    """
    texts_and_opts: list of (text, {bold, italic, color, size, font_face, bullet, breakLine})
    """
    if clear:
        # Clear existing paragraphs
        for i in range(len(tf.paragraphs)-1, -1, -1):
            p = tf.paragraphs[i]._p
            if i > 0:
                p.getparent().remove(p)
        tf.paragraphs[0].clear()

    from pptx.oxml.ns import qn
    from lxml import etree
    import copy

    first_para = True
    for (text, opts) in texts_and_opts:
        if first_para:
            p_elem = tf.paragraphs[0]._p
            first_para = False
        else:
            # Add new paragraph element
            last_p = tf.paragraphs[-1]._p
            new_p = copy.deepcopy(last_p)
            # Clear runs from new paragraph
            for r in new_p.findall(qn('a:r')):
                new_p.remove(r)
            for br in new_p.findall(qn('a:br')):
                new_p.remove(br)
            last_p.addnext(new_p)
            p_elem = new_p

        # Configure paragraph properties
        pPr = p_elem.find(qn('a:pPr'))
        if pPr is None:
            pPr = etree.SubElement(p_elem, qn('a:pPr'))
            p_elem.insert(0, pPr)

        if opts.get('bullet'):
            pPr.set('indent', '-342900')
            pPr.set('marL', '342900')
            buNone = pPr.find(qn('a:buNone'))
            if buNone is not None:
                pPr.remove(buNone)
            buChar = pPr.find(qn('a:buChar'))
            if buChar is None:
                buChar = etree.SubElement(pPr, qn('a:buChar'))
            buChar.set('char', '•')
            # Set bullet color
            buClr = pPr.find(qn('a:buClr'))
            if buClr is None:
                buClr = etree.SubElement(pPr, qn('a:buClr'))
            solidFill = buClr.find(qn('a:srgbClr'))
            if solidFill is None:
                solidFill = etree.SubElement(buClr, qn('a:srgbClr'))
            bullet_color = opts.get('bullet_color', NAVY)
            solidFill.set('val', '{:02X}{:02X}{:02X}'.format(*bullet_color))
        else:
            buNone = pPr.find(qn('a:buNone'))
            if buNone is None:
                buNone = etree.SubElement(pPr, qn('a:buNone'))

        spc_after = opts.get('space_after', None)
        if spc_after is not None:
            spcAft = etree.SubElement(pPr, qn('a:spcAft'))
            spcPts = etree.SubElement(spcAft, qn('a:spcPts'))
            spcPts.set('val', str(spc_after * 100))

        # Add run
        r_elem = etree.SubElement(p_elem, qn('a:r'))
        rPr = etree.SubElement(r_elem, qn('a:rPr'))
        rPr.set('lang', 'ru-RU')
        rPr.set('altLang', 'en-US')

        color = opts.get('color', NAVY)
        solidFill2 = etree.SubElement(rPr, qn('a:solidFill'))
        srgbClr2 = etree.SubElement(solidFill2, qn('a:srgbClr'))
        srgbClr2.set('val', '{:02X}{:02X}{:02X}'.format(*color))

        if opts.get('bold'):
            rPr.set('b', '1')
        if opts.get('italic'):
            rPr.set('i', '1')

        font_face = opts.get('font_face', 'Calibri')
        sz = opts.get('size', 14)
        rPr.set('sz', str(int(sz * 100)))

        latin = etree.SubElement(rPr, qn('a:latin'))
        latin.set('typeface', font_face)

        t_elem = etree.SubElement(r_elem, qn('a:t'))
        t_elem.text = text


# ─── Presentation setup ──────────────────────────────────────────────────────
prs = Presentation()
prs.slide_width  = Inches(10)
prs.slide_height = Inches(5.625)
blank_layout = prs.slide_layouts[6]  # blank


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE 1 — Title (dark navy background)
# ═══════════════════════════════════════════════════════════════════════════
s1 = prs.slides.add_slide(blank_layout)
set_slide_bg(s1, NAVY)

# Decorative semi-transparent circle bottom-right
circ = s1.shapes.add_shape(
    9,  # OVAL
    inches(7.2), inches(3.0), inches(4.5), inches(4.5)
)
circ.fill.solid()
circ.fill.fore_color.rgb = RGBColor(0x2A, 0x5A, 0x8F)  # lighter navy
circ.line.fill.background()

# Another smaller circle
circ2 = s1.shapes.add_shape(9, inches(7.9), inches(0.8), inches(3.0), inches(3.0))
circ2.fill.solid()
circ2.fill.fore_color.rgb = RGBColor(0x16, 0x4A, 0x75)
circ2.line.fill.background()

# Emerald top accent bar
add_filled_shape(s1, 0, 0, 10, 0.08, EMERALD)

# Main title
tb_title = s1.shapes.add_textbox(inches(0.5), inches(1.0), inches(7.5), inches(1.5))
tb_title.text_frame.word_wrap = True
p = tb_title.text_frame.paragraphs[0]
p.alignment = PP_ALIGN.LEFT
run = p.add_run()
run.text = "Умный Календарь"
run.font.size = Pt(48)
run.font.bold = True
run.font.color.rgb = WHITE
run.font.name = "Calibri"

# Subtitle
tb_sub = s1.shapes.add_textbox(inches(0.5), inches(2.6), inches(7.5), inches(1.0))
tb_sub.text_frame.word_wrap = True
p2 = tb_sub.text_frame.paragraphs[0]
p2.alignment = PP_ALIGN.LEFT
run2 = p2.add_run()
run2.text = "Веб-приложение для управления событиями и задачами"
run2.font.size = Pt(22)
run2.font.bold = False
run2.font.color.rgb = EMERALD
run2.font.name = "Calibri"

# Bottom line
tb_bottom = s1.shapes.add_textbox(inches(0.5), inches(4.8), inches(9.0), inches(0.6))
p3 = tb_bottom.text_frame.paragraphs[0]
p3.alignment = PP_ALIGN.LEFT
run3 = p3.add_run()
run3.text = "Курсовой проект  •  Next.js + FastAPI + PostgreSQL"
run3.font.size = Pt(14)
run3.font.color.rgb = RGBColor(0xB0, 0xC8, 0xE8)
run3.font.name = "Calibri"


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE 2 — Цель проекта (light bg)
# ═══════════════════════════════════════════════════════════════════════════
s2 = prs.slides.add_slide(blank_layout)
set_slide_bg(s2, LIGHT)

# Left accent bar
add_left_bar(s2)

# Title
tb = s2.shapes.add_textbox(inches(0.35), inches(0.18), inches(8.5), inches(0.7))
p = tb.text_frame.paragraphs[0]
run = p.add_run()
run.text = "Цель проекта"
run.font.size = Pt(36)
run.font.bold = True
run.font.color.rgb = NAVY
run.font.name = "Calibri"

# Separator line
add_filled_shape(s2, 0.35, 0.92, 9.3, 0.04, EMERALD)

# Goal box with emerald left border
add_filled_shape(s2, 0.35, 1.05, 5.8, 0.85, WHITE)
add_filled_shape(s2, 0.35, 1.05, 0.07, 0.85, EMERALD)  # emerald left border

goal_tb = s2.shapes.add_textbox(inches(0.5), inches(1.08), inches(5.55), inches(0.8))
goal_tb.text_frame.word_wrap = True
p = goal_tb.text_frame.paragraphs[0]
p.alignment = PP_ALIGN.LEFT
run = p.add_run()
run.text = "Разработать полнофункциональное веб-приложение-планировщик с авторизацией и хранением данных на сервере"
run.font.size = Pt(13)
run.font.bold = False
run.font.color.rgb = NAVY
run.font.name = "Calibri"
run.font.italic = True

# Bullet tasks
tasks = [
    "Реализовать JWT-аутентификацию (регистрация / вход / выход)",
    "Календарь: режимы просмотра Месяц и Неделя",
    "CRUD-операции для событий: встречи, задачи, заметки",
    "Раздел «Заметки» с привязкой к датам",
    "Аналитика активности за неделю и месяц",
    "Адаптивный интерфейс (мобиль + десктоп)",
]

y_start = 2.05
for i, task in enumerate(tasks):
    # bullet dot
    add_filled_shape(s2, 0.42, y_start + 0.06, 0.07, 0.07, EMERALD)
    tb_task = s2.shapes.add_textbox(inches(0.58), inches(y_start), inches(5.6), inches(0.38))
    tb_task.text_frame.word_wrap = True
    p = tb_task.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = task
    run.font.size = Pt(12.5)
    run.font.color.rgb = NAVY
    run.font.name = "Calibri"
    y_start += 0.38

# Right decorative panel
add_filled_shape(s2, 6.5, 1.05, 3.1, 4.2, NAVY)
add_filled_shape(s2, 6.57, 1.12, 2.96, 0.45, EMERALD)

panel_title = s2.shapes.add_textbox(inches(6.65), inches(1.15), inches(2.8), inches(0.4))
p = panel_title.text_frame.paragraphs[0]
run = p.add_run()
run.text = "ЗАДАЧИ"
run.font.size = Pt(16)
run.font.bold = True
run.font.color.rgb = NAVY
run.font.name = "Calibri"

panel_items = ["01  Аутентификация", "02  Календарь", "03  События", "04  Заметки", "05  Аналитика", "06  Адаптивность"]
for i, item in enumerate(panel_items):
    # Draw alternating band FIRST, then text on top
    if i % 2 == 0:
        add_filled_shape(s2, 6.57, 1.68 + i*0.48, 2.96, 0.43, RGBColor(0x25, 0x4A, 0x70))
    ti = s2.shapes.add_textbox(inches(6.65), inches(1.7 + i*0.48), inches(2.8), inches(0.45))
    ti.text_frame.word_wrap = True
    p = ti.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = item
    run.font.size = Pt(13)
    run.font.color.rgb = WHITE
    run.font.name = "Calibri"


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE 3 — Архитектура (light bg)
# ═══════════════════════════════════════════════════════════════════════════
s3 = prs.slides.add_slide(blank_layout)
set_slide_bg(s3, LIGHT)
add_left_bar(s3)

# Title
tb = s3.shapes.add_textbox(inches(0.35), inches(0.18), inches(9.0), inches(0.7))
p = tb.text_frame.paragraphs[0]
run = p.add_run()
run.text = "Архитектура приложения"
run.font.size = Pt(36)
run.font.bold = True
run.font.color.rgb = NAVY
run.font.name = "Calibri"

add_filled_shape(s3, 0.35, 0.92, 9.3, 0.04, EMERALD)

# Architecture diagram — boxes connected by arrows
arch_left = 1.2
arch_w = 3.2

# Box 1: Browser/Phone (emerald)
add_filled_shape(s3, arch_left, 1.05, arch_w, 0.65, EMERALD)
tb1 = s3.shapes.add_textbox(inches(arch_left), inches(1.05), inches(arch_w), inches(0.65))
tb1.text_frame.word_wrap = True
p = tb1.text_frame.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
run = p.add_run()
run.text = "Браузер / Телефон"
run.font.size = Pt(15)
run.font.bold = True
run.font.color.rgb = WHITE
run.font.name = "Calibri"

# Arrow 1 + label
add_filled_shape(s3, arch_left + arch_w/2 - 0.03, 1.72, 0.06, 0.35, RGBColor(0x64,0x74,0x8B))
# Arrow head
arr1 = s3.shapes.add_shape(5, inches(arch_left + arch_w/2 - 0.12), inches(2.05), inches(0.24), inches(0.15))
arr1.fill.solid(); arr1.fill.fore_color.rgb = RGBColor(0x64,0x74,0x8B); arr1.line.fill.background()
lbl1 = s3.shapes.add_textbox(inches(arch_left + arch_w/2 + 0.15), inches(1.78), inches(1.8), inches(0.3))
p = lbl1.text_frame.paragraphs[0]
run = p.add_run()
run.text = "HTTP + JSON + JWT"
run.font.size = Pt(9)
run.font.color.rgb = SLATE
run.font.name = "Calibri"

# Box 2: Frontend Next.js (navy)
add_filled_shape(s3, arch_left, 2.22, arch_w, 0.7, NAVY)
tb2 = s3.shapes.add_textbox(inches(arch_left), inches(2.25), inches(arch_w), inches(0.65))
tb2.text_frame.word_wrap = True
p = tb2.text_frame.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
run = p.add_run()
run.text = "Frontend: Next.js 14"
run.font.size = Pt(14)
run.font.bold = True
run.font.color.rgb = WHITE
run.font.name = "Calibri"
# port label
p2 = tb2.text_frame.add_paragraph()
p2.alignment = PP_ALIGN.CENTER
run2 = p2.add_run()
run2.text = "порт 3000"
run2.font.size = Pt(11)
run2.font.color.rgb = EMERALD
run2.font.name = "Calibri"

# Arrow 2 + label
add_filled_shape(s3, arch_left + arch_w/2 - 0.03, 2.94, 0.06, 0.35, RGBColor(0x64,0x74,0x8B))
arr2 = s3.shapes.add_shape(5, inches(arch_left + arch_w/2 - 0.12), inches(3.27), inches(0.24), inches(0.15))
arr2.fill.solid(); arr2.fill.fore_color.rgb = RGBColor(0x64,0x74,0x8B); arr2.line.fill.background()
lbl2 = s3.shapes.add_textbox(inches(arch_left + arch_w/2 + 0.15), inches(3.0), inches(1.5), inches(0.3))
p = lbl2.text_frame.paragraphs[0]
run = p.add_run()
run.text = "REST API"
run.font.size = Pt(9)
run.font.color.rgb = SLATE
run.font.name = "Calibri"

# Box 3: Backend FastAPI (navy)
add_filled_shape(s3, arch_left, 3.44, arch_w, 0.7, NAVY)
tb3 = s3.shapes.add_textbox(inches(arch_left), inches(3.47), inches(arch_w), inches(0.65))
tb3.text_frame.word_wrap = True
p = tb3.text_frame.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
run = p.add_run()
run.text = "Backend: FastAPI"
run.font.size = Pt(14)
run.font.bold = True
run.font.color.rgb = WHITE
run.font.name = "Calibri"
p2 = tb3.text_frame.add_paragraph()
p2.alignment = PP_ALIGN.CENTER
run2 = p2.add_run()
run2.text = "порт 8000"
run2.font.size = Pt(11)
run2.font.color.rgb = EMERALD
run2.font.name = "Calibri"

# Arrow 3 + label
add_filled_shape(s3, arch_left + arch_w/2 - 0.03, 4.16, 0.06, 0.3, RGBColor(0x64,0x74,0x8B))
arr3 = s3.shapes.add_shape(5, inches(arch_left + arch_w/2 - 0.12), inches(4.44), inches(0.24), inches(0.15))
arr3.fill.solid(); arr3.fill.fore_color.rgb = RGBColor(0x64,0x74,0x8B); arr3.line.fill.background()
lbl3 = s3.shapes.add_textbox(inches(arch_left + arch_w/2 + 0.15), inches(4.2), inches(2.0), inches(0.3))
p = lbl3.text_frame.paragraphs[0]
run = p.add_run()
run.text = "SQLAlchemy ORM"
run.font.size = Pt(9)
run.font.color.rgb = SLATE
run.font.name = "Calibri"

# Box 4: PostgreSQL (steel blue)
add_filled_shape(s3, arch_left, 4.6, arch_w, 0.65, STEEL)
tb4 = s3.shapes.add_textbox(inches(arch_left), inches(4.63), inches(arch_w), inches(0.55))
tb4.text_frame.word_wrap = True
p = tb4.text_frame.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
run = p.add_run()
run.text = "PostgreSQL"
run.font.size = Pt(14)
run.font.bold = True
run.font.color.rgb = WHITE
run.font.name = "Calibri"

# Right side text panel
add_filled_shape(s3, 5.3, 1.05, 4.35, 4.2, NAVY)
add_filled_shape(s3, 5.37, 1.12, 4.21, 0.4, EMERALD)
rt = s3.shapes.add_textbox(inches(5.45), inches(1.15), inches(4.05), inches(0.35))
p = rt.text_frame.paragraphs[0]
run = p.add_run()
run.text = "ПРИНЦИП РАБОТЫ"
run.font.size = Pt(14)
run.font.bold = True
run.font.color.rgb = NAVY
run.font.name = "Calibri"

note_text = "Фронтенд и бэкенд — независимые процессы, общаются только через HTTP"
rt2 = s3.shapes.add_textbox(inches(5.45), inches(1.68), inches(4.05), inches(0.75))
rt2.text_frame.word_wrap = True
p = rt2.text_frame.paragraphs[0]
run = p.add_run()
run.text = note_text
run.font.size = Pt(13)
run.font.color.rgb = WHITE
run.font.name = "Calibri"
run.font.italic = True

details = [
    ("Next.js", "Server-Side Rendering + static generation"),
    ("FastAPI", "async, OpenAPI /docs автоматически"),
    ("PostgreSQL", "реляционная БД, ACID-транзакции"),
    ("Docker", "единый docker-compose для запуска"),
]
y_d = 2.65
for key, val in details:
    add_filled_shape(s3, 5.37, y_d, 4.21, 0.42, RGBColor(0x25, 0x4A, 0x70))
    dkb = s3.shapes.add_textbox(inches(5.5), inches(y_d + 0.03), inches(1.2), inches(0.35))
    p = dkb.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = key
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = EMERALD
    run.font.name = "Calibri"

    dval = s3.shapes.add_textbox(inches(6.8), inches(y_d + 0.04), inches(2.8), inches(0.35))
    dval.text_frame.word_wrap = True
    p = dval.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = val
    run.font.size = Pt(11)
    run.font.color.rgb = WHITE
    run.font.name = "Calibri"
    y_d += 0.5


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE 4 — Технологический стек (light bg)
# ═══════════════════════════════════════════════════════════════════════════
s4 = prs.slides.add_slide(blank_layout)
set_slide_bg(s4, LIGHT)
add_left_bar(s4)

tb = s4.shapes.add_textbox(inches(0.35), inches(0.18), inches(9.0), inches(0.7))
p = tb.text_frame.paragraphs[0]
run = p.add_run()
run.text = "Технологический стек"
run.font.size = Pt(36)
run.font.bold = True
run.font.color.rgb = NAVY
run.font.name = "Calibri"

add_filled_shape(s4, 0.35, 0.92, 9.3, 0.04, EMERALD)

# Three cards
cards = [
    {
        "header_color": EMERALD,
        "header_text": "FRONTEND",
        "header_text_color": WHITE,
        "items": ["Next.js 14", "TypeScript", "Tailwind CSS", "Recharts"],
        "left": 0.35,
    },
    {
        "header_color": NAVY,
        "header_text": "BACKEND",
        "header_text_color": WHITE,
        "items": ["FastAPI", "SQLAlchemy 2.0", "Alembic", "python-jose + passlib"],
        "left": 3.62,
    },
    {
        "header_color": STEEL,
        "header_text": "БАЗА ДАННЫХ",
        "header_text_color": WHITE,
        "items": ["PostgreSQL", "Реляционная СУБД", "ACID-транзакции", "Docker-контейнер"],
        "left": 6.88,
    },
]
card_w = 3.0
card_top = 1.05

for card in cards:
    cl = card["left"]
    # Card background
    add_filled_shape(s4, cl, card_top, card_w, 4.2, WHITE)
    # Card header
    add_filled_shape(s4, cl, card_top, card_w, 0.65, card["header_color"])
    h_tb = s4.shapes.add_textbox(inches(cl), inches(card_top + 0.12), inches(card_w), inches(0.5))
    p = h_tb.text_frame.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = card["header_text"]
    run.font.size = Pt(18)
    run.font.bold = True
    run.font.color.rgb = card["header_text_color"]
    run.font.name = "Calibri"

    # Card items
    for idx, item in enumerate(card["items"]):
        item_y = card_top + 0.75 + idx * 0.78
        # icon circle
        dot = s4.shapes.add_shape(9, inches(cl + 0.2), inches(item_y + 0.06), inches(0.2), inches(0.2))
        dot.fill.solid()
        dot.fill.fore_color.rgb = card["header_color"]
        dot.line.fill.background()

        it_tb = s4.shapes.add_textbox(inches(cl + 0.5), inches(item_y), inches(card_w - 0.6), inches(0.55))
        it_tb.text_frame.word_wrap = True
        p = it_tb.text_frame.paragraphs[0]
        run = p.add_run()
        run.text = item
        run.font.size = Pt(14)
        run.font.color.rgb = NAVY
        run.font.name = "Calibri"
        # Subtle line
        if idx < len(card["items"]) - 1:
            add_filled_shape(s4, cl + 0.15, item_y + 0.55, card_w - 0.3, 0.02, RGBColor(0xE0, 0xF0, 0xE8))


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE 5 — JWT Authorization (light bg)
# ═══════════════════════════════════════════════════════════════════════════
s5 = prs.slides.add_slide(blank_layout)
set_slide_bg(s5, LIGHT)
add_left_bar(s5)

tb = s5.shapes.add_textbox(inches(0.35), inches(0.18), inches(9.0), inches(0.7))
p = tb.text_frame.paragraphs[0]
run = p.add_run()
run.text = "Система авторизации (JWT)"
run.font.size = Pt(36)
run.font.bold = True
run.font.color.rgb = NAVY
run.font.name = "Calibri"

add_filled_shape(s5, 0.35, 0.92, 9.3, 0.04, EMERALD)

steps = [
    "Пользователь вводит email + пароль",
    "Сервер проверяет bcrypt-хэш пароля",
    "Выдаются два токена: Access (30 мин) + Refresh (7 дней)",
    "Токены хранятся в localStorage браузера",
    "Каждый запрос: заголовок Authorization: Bearer <token>",
    "При 401 — автообновление через refresh endpoint",
]

step_colors = [EMERALD, NAVY, EMERALD, NAVY, EMERALD, NAVY]

for i, (step, sc) in enumerate(zip(steps, step_colors)):
    row = i // 2
    col = i % 2
    sx = 0.35 + col * 4.7
    sy = 1.1 + row * 1.1

    # Number circle
    circ = s5.shapes.add_shape(9, inches(sx), inches(sy), inches(0.5), inches(0.5))
    circ.fill.solid()
    circ.fill.fore_color.rgb = sc
    circ.line.fill.background()

    num_tb = s5.shapes.add_textbox(inches(sx), inches(sy + 0.05), inches(0.5), inches(0.4))
    p = num_tb.text_frame.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = str(i + 1)
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = WHITE
    run.font.name = "Calibri"

    step_tb = s5.shapes.add_textbox(inches(sx + 0.6), inches(sy), inches(3.9), inches(0.7))
    step_tb.text_frame.word_wrap = True
    p = step_tb.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = step
    run.font.size = Pt(13)
    run.font.color.rgb = NAVY
    run.font.name = "Calibri"

# Bottom note box
add_filled_shape(s5, 0.35, 4.55, 9.3, 0.7, NAVY)
add_filled_shape(s5, 0.35, 4.55, 0.07, 0.7, EMERALD)
note = s5.shapes.add_textbox(inches(0.52), inches(4.62), inches(9.0), inches(0.55))
note.text_frame.word_wrap = True
p = note.text_frame.paragraphs[0]
run = p.add_run()
run.text = "⚠  Без токена — redirect на /auth"
run.font.size = Pt(14)
run.font.bold = True
run.font.color.rgb = EMERALD
run.font.name = "Calibri"


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE 6 — Модель данных (light bg)
# ═══════════════════════════════════════════════════════════════════════════
s6 = prs.slides.add_slide(blank_layout)
set_slide_bg(s6, LIGHT)
add_left_bar(s6)

tb = s6.shapes.add_textbox(inches(0.35), inches(0.18), inches(9.0), inches(0.7))
p = tb.text_frame.paragraphs[0]
run = p.add_run()
run.text = "Модель данных"
run.font.size = Pt(36)
run.font.bold = True
run.font.color.rgb = NAVY
run.font.name = "Calibri"

add_filled_shape(s6, 0.35, 0.92, 9.3, 0.04, EMERALD)

# Field row pitch (compact to fit 8-field events table)
FIELD_H = 0.21
HDR_H   = 0.44

def calc_th(n_fields):
    return HDR_H + n_fields * FIELD_H + 0.10

# Row 1 top; Row 2 top = row1_top + max(users_h, events_h) + gap
row1_top = 1.05
# events has 8 fields → tallest in row 1
events_th = calc_th(8)   # 0.44 + 1.68 + 0.10 = 2.22
row2_top = row1_top + events_th + 0.14   # ≈ 3.41

tables = [
    {
        "name": "users",
        "fields": ["id", "email", "name", "hashed_password", "created_at"],
        "header_color": EMERALD,
        "left": 0.35, "top": row1_top,
    },
    {
        "name": "events",
        "fields": ["id", "user_id", "title", "date", "start_time", "end_time", "type", "link"],
        "header_color": NAVY,
        "left": 5.15, "top": row1_top,
    },
    {
        "name": "notes",
        "fields": ["id", "user_id", "title", "text", "date", "created_at"],
        "header_color": STEEL,
        "left": 0.35, "top": row2_top,
    },
    {
        "name": "notifications",
        "fields": ["id", "user_id", "event_id", "message", "is_read", "send_at"],
        "header_color": TEAL,
        "left": 5.15, "top": row2_top,
    },
]

for tbl in tables:
    tl = tbl["left"]
    tt = tbl["top"]
    tw = 4.55
    n_fields = len(tbl["fields"])
    th = calc_th(n_fields)

    # Card bg
    add_filled_shape(s6, tl, tt, tw, th, WHITE)
    # Header
    add_filled_shape(s6, tl, tt, tw, HDR_H, tbl["header_color"])
    # Left accent
    add_filled_shape(s6, tl, tt, 0.06, th, tbl["header_color"])

    h_tb = s6.shapes.add_textbox(inches(tl + 0.12), inches(tt + 0.08), inches(tw - 0.2), inches(HDR_H - 0.05))
    p = h_tb.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = tbl["name"]
    run.font.size = Pt(14)
    run.font.bold = True
    run.font.color.rgb = WHITE
    run.font.name = "Consolas"

    for fi, field in enumerate(tbl["fields"]):
        fy = tt + HDR_H + 0.04 + fi * FIELD_H
        add_filled_shape(s6, tl + 0.12, fy + 0.05, 0.06, 0.06, tbl["header_color"])
        f_tb = s6.shapes.add_textbox(inches(tl + 0.26), inches(fy), inches(tw - 0.38), inches(FIELD_H))
        p = f_tb.text_frame.paragraphs[0]
        run = p.add_run()
        run.text = field
        run.font.size = Pt(10.5)
        run.font.color.rgb = NAVY
        run.font.name = "Consolas"

# Note at bottom — position after bottom row cards
notes_th = calc_th(6)
note_y = row2_top + notes_th + 0.1
if note_y > 5.25:
    note_y = 5.25
add_filled_shape(s6, 0.35, note_y, 9.3, 0.27, RGBColor(0xE8, 0xF5, 0xEE))
note = s6.shapes.add_textbox(inches(0.5), inches(note_y + 0.03), inches(9.0), inches(0.24))
p = note.text_frame.paragraphs[0]
run = p.add_run()
run.text = "CASCADE DELETE — удаление пользователя удаляет все его данные"
run.font.size = Pt(11)
run.font.color.rgb = NAVY
run.font.name = "Calibri"
run.font.italic = True


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE 7 — REST API (light bg)
# ═══════════════════════════════════════════════════════════════════════════
s7 = prs.slides.add_slide(blank_layout)
set_slide_bg(s7, LIGHT)
add_left_bar(s7)

tb = s7.shapes.add_textbox(inches(0.35), inches(0.18), inches(9.0), inches(0.7))
p = tb.text_frame.paragraphs[0]
run = p.add_run()
run.text = "REST API — ключевые эндпоинты"
run.font.size = Pt(36)
run.font.bold = True
run.font.color.rgb = NAVY
run.font.name = "Calibri"

add_filled_shape(s7, 0.35, 0.92, 9.3, 0.04, EMERALD)

api_sections = [
    {
        "label": "Auth",
        "color": EMERALD,
        "endpoints": ["POST /register", "POST /login", "POST /refresh", "GET /me"],
        "left": 0.35, "top": 1.05,
    },
    {
        "label": "Events",
        "color": NAVY,
        "endpoints": ["GET /events?from_date=&to_date=", "POST /events", "PUT /events/{id}", "DELETE /events/{id}"],
        "left": 5.15, "top": 1.05,
    },
    {
        "label": "Notes",
        "color": STEEL,
        "endpoints": ["GET /notes", "POST /notes", "PUT /notes/{id}", "DELETE /notes/{id}"],
        "left": 0.35, "top": 3.3,
    },
    {
        "label": "Analytics",
        "color": SLATE,
        "endpoints": ["GET /analytics?from=&to=", "GET /analytics/week", "GET /analytics/month"],
        "left": 5.15, "top": 3.3,
    },
]

for sec in api_sections:
    sl = sec["left"]
    st = sec["top"]
    sw = 4.55

    # Section header
    add_filled_shape(s7, sl, st, sw, 0.45, sec["color"])
    h_tb = s7.shapes.add_textbox(inches(sl + 0.15), inches(st + 0.08), inches(sw - 0.2), inches(0.35))
    p = h_tb.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = sec["label"]
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = WHITE
    run.font.name = "Calibri"

    # Endpoints box
    ep_h = len(sec["endpoints"]) * 0.4 + 0.15
    add_filled_shape(s7, sl, st + 0.45, sw, ep_h, RGBColor(0xF8, 0xFC, 0xFA))
    add_filled_shape(s7, sl, st + 0.45, 0.06, ep_h, sec["color"])

    for ei, ep in enumerate(sec["endpoints"]):
        ep_y = st + 0.48 + ei * 0.4
        ep_tb = s7.shapes.add_textbox(inches(sl + 0.15), inches(ep_y), inches(sw - 0.2), inches(0.38))
        ep_tb.text_frame.word_wrap = False
        p = ep_tb.text_frame.paragraphs[0]
        run = p.add_run()
        run.text = ep
        run.font.size = Pt(12)
        run.font.color.rgb = NAVY
        run.font.name = "Consolas"


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE 8 — Frontend structure (light bg)
# ═══════════════════════════════════════════════════════════════════════════
s8 = prs.slides.add_slide(blank_layout)
set_slide_bg(s8, LIGHT)
add_left_bar(s8)

tb = s8.shapes.add_textbox(inches(0.35), inches(0.18), inches(9.0), inches(0.7))
p = tb.text_frame.paragraphs[0]
run = p.add_run()
run.text = "Структура фронтенда (Next.js)"
run.font.size = Pt(36)
run.font.bold = True
run.font.color.rgb = NAVY
run.font.name = "Calibri"

add_filled_shape(s8, 0.35, 0.92, 9.3, 0.04, EMERALD)

# Left half: Pages
add_filled_shape(s8, 0.35, 1.05, 4.55, 0.45, EMERALD)
lh_t = s8.shapes.add_textbox(inches(0.5), inches(1.1), inches(4.0), inches(0.38))
p = lh_t.text_frame.paragraphs[0]
run = p.add_run()
run.text = "Страницы (Pages)"
run.font.size = Pt(16)
run.font.bold = True
run.font.color.rgb = WHITE
run.font.name = "Calibri"

pages = [
    ("/auth", "вход и регистрация"),
    ("/dashboard", "календарь + события дня"),
    ("/notes", "список заметок"),
    ("/analytics", "графики активности"),
]

for i, (route, desc) in enumerate(pages):
    py = 1.65 + i * 0.85
    add_filled_shape(s8, 0.35, py, 4.55, 0.75, WHITE)
    add_filled_shape(s8, 0.35, py, 0.06, 0.75, EMERALD)

    # Route chip
    add_filled_shape(s8, 0.5, py + 0.1, 1.4, 0.28, NAVY)
    rt_tb = s8.shapes.add_textbox(inches(0.55), inches(py + 0.12), inches(1.3), inches(0.24))
    p = rt_tb.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = route
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = EMERALD
    run.font.name = "Consolas"

    desc_tb = s8.shapes.add_textbox(inches(2.05), inches(py + 0.1), inches(2.75), inches(0.55))
    desc_tb.text_frame.word_wrap = True
    p = desc_tb.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = desc
    run.font.size = Pt(13)
    run.font.color.rgb = NAVY
    run.font.name = "Calibri"

# Right half: Components
add_filled_shape(s8, 5.15, 1.05, 4.55, 0.45, NAVY)
rh_t = s8.shapes.add_textbox(inches(5.3), inches(1.1), inches(4.0), inches(0.38))
p = rh_t.text_frame.paragraphs[0]
run = p.add_run()
run.text = "Компоненты"
run.font.size = Pt(16)
run.font.bold = True
run.font.color.rgb = WHITE
run.font.name = "Calibri"

components = [
    ("Header", "навигация + адаптивное меню"),
    ("MonthView", "сетка месяца с точками"),
    ("WeekView", "список по дням недели"),
    ("EventForm", "модальная форма"),
    ("api.ts", "HTTP-клиент с JWT"),
]

for i, (comp, desc) in enumerate(components):
    cy = 1.65 + i * 0.75
    add_filled_shape(s8, 5.15, cy, 4.55, 0.65, WHITE)
    add_filled_shape(s8, 5.15, cy, 0.06, 0.65, NAVY)

    ct_tb = s8.shapes.add_textbox(inches(5.3), inches(cy + 0.07), inches(1.4), inches(0.28))
    p = ct_tb.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = comp
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = NAVY
    run.font.name = "Consolas"

    cd_tb = s8.shapes.add_textbox(inches(6.8), inches(cy + 0.07), inches(2.75), inches(0.5))
    cd_tb.text_frame.word_wrap = True
    p = cd_tb.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = desc
    run.font.size = Pt(12)
    run.font.color.rgb = SLATE
    run.font.name = "Calibri"


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE 9 — Адаптивный дизайн (light bg)
# ═══════════════════════════════════════════════════════════════════════════
s9 = prs.slides.add_slide(blank_layout)
set_slide_bg(s9, LIGHT)
add_left_bar(s9)

tb = s9.shapes.add_textbox(inches(0.35), inches(0.18), inches(9.0), inches(0.7))
p = tb.text_frame.paragraphs[0]
run = p.add_run()
run.text = "Адаптивный дизайн (Mobile First)"
run.font.size = Pt(36)
run.font.bold = True
run.font.color.rgb = NAVY
run.font.name = "Calibri"

add_filled_shape(s9, 0.35, 0.92, 9.3, 0.04, EMERALD)

# Left column — Mobile
add_filled_shape(s9, 0.35, 1.05, 4.55, 0.55, EMERALD)
# Phone icon (simplified rectangle)
add_filled_shape(s9, 0.45, 1.1, 0.25, 0.42, WHITE)

mob_t = s9.shapes.add_textbox(inches(0.8), inches(1.12), inches(3.9), inches(0.45))
p = mob_t.text_frame.paragraphs[0]
run = p.add_run()
run.text = "МОБИЛЬ  < 768px"
run.font.size = Pt(16)
run.font.bold = True
run.font.color.rgb = WHITE
run.font.name = "Calibri"

mob_items = [
    "Hamburger-меню вместо навигации",
    "Вертикальный layout",
    "Аккордеон для списка событий",
    "Компактные ячейки календаря",
]
add_filled_shape(s9, 0.35, 1.62, 4.55, 3.65, WHITE)
add_filled_shape(s9, 0.35, 1.62, 0.06, 3.65, EMERALD)
for i, item in enumerate(mob_items):
    iy = 1.75 + i * 0.85
    add_filled_shape(s9, 0.52, iy + 0.12, 0.18, 0.18, EMERALD)
    it_tb = s9.shapes.add_textbox(inches(0.8), inches(iy), inches(3.95), inches(0.65))
    it_tb.text_frame.word_wrap = True
    p = it_tb.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = item
    run.font.size = Pt(14)
    run.font.color.rgb = NAVY
    run.font.name = "Calibri"

# Right column — Desktop
add_filled_shape(s9, 5.15, 1.05, 4.55, 0.55, NAVY)
desk_t = s9.shapes.add_textbox(inches(5.3), inches(1.12), inches(4.1), inches(0.45))
p = desk_t.text_frame.paragraphs[0]
run = p.add_run()
run.text = "ДЕСКТОП  ≥ 768px"
run.font.size = Pt(16)
run.font.bold = True
run.font.color.rgb = WHITE
run.font.name = "Calibri"

desk_items = [
    "Горизонтальная навигация",
    "Двухколоночный layout",
    "Полная боковая панель событий",
    "Имя пользователя и кнопка выхода",
]
add_filled_shape(s9, 5.15, 1.62, 4.55, 3.65, WHITE)
add_filled_shape(s9, 5.15, 1.62, 0.06, 3.65, NAVY)
for i, item in enumerate(desk_items):
    iy = 1.75 + i * 0.85
    add_filled_shape(s9, 5.32, iy + 0.12, 0.18, 0.18, STEEL)
    it_tb = s9.shapes.add_textbox(inches(5.6), inches(iy), inches(4.0), inches(0.65))
    it_tb.text_frame.word_wrap = True
    p = it_tb.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = item
    run.font.size = Pt(14)
    run.font.color.rgb = NAVY
    run.font.name = "Calibri"


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE 10 — Результаты / Conclusion (dark navy bg)
# ═══════════════════════════════════════════════════════════════════════════
s10 = prs.slides.add_slide(blank_layout)
set_slide_bg(s10, NAVY)

# Emerald top bar
add_filled_shape(s10, 0, 0, 10, 0.1, EMERALD)
# Decorative circle top-right
circ3 = s10.shapes.add_shape(9, inches(7.5), inches(-1.0), inches(4.5), inches(4.5))
circ3.fill.solid()
circ3.fill.fore_color.rgb = RGBColor(0x25, 0x4A, 0x70)
circ3.line.fill.background()

# Title
tb = s10.shapes.add_textbox(inches(0.5), inches(0.2), inches(8.5), inches(0.75))
p = tb.text_frame.paragraphs[0]
run = p.add_run()
run.text = "Результаты"
run.font.size = Pt(40)
run.font.bold = True
run.font.color.rgb = WHITE
run.font.name = "Calibri"

# Separator
add_filled_shape(s10, 0.5, 1.0, 9.0, 0.05, EMERALD)

left_achievements = [
    "JWT-авторизация с auto-refresh",
    "Календарь: Месяц и Неделя",
    "CRUD событий трёх типов",
    "Раздел заметок",
]
right_achievements = [
    "Аналитика с графиками",
    "Адаптивный интерфейс",
    "Данные в PostgreSQL",
    "Swagger /docs + Docker",
]

for col_idx, (achievements, left_x) in enumerate([(left_achievements, 0.5), (right_achievements, 5.3)]):
    for i, ach in enumerate(achievements):
        ay = 1.2 + i * 0.78
        # Checkmark circle
        ck = s10.shapes.add_shape(9, inches(left_x), inches(ay), inches(0.42), inches(0.42))
        ck.fill.solid()
        ck.fill.fore_color.rgb = EMERALD
        ck.line.fill.background()
        # Checkmark text
        ck_tb = s10.shapes.add_textbox(inches(left_x), inches(ay + 0.04), inches(0.42), inches(0.36))
        p = ck_tb.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        run = p.add_run()
        run.text = "✓"
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = WHITE
        run.font.name = "Calibri"

        # Achievement text
        ach_tb = s10.shapes.add_textbox(inches(left_x + 0.55), inches(ay + 0.04), inches(4.5), inches(0.55))
        ach_tb.text_frame.word_wrap = True
        p = ach_tb.text_frame.paragraphs[0]
        run = p.add_run()
        run.text = ach
        run.font.size = Pt(15)
        run.font.color.rgb = WHITE
        run.font.name = "Calibri"

# Bottom conclusion text
add_filled_shape(s10, 0.5, 4.8, 9.0, 0.58, RGBColor(0x25, 0x4A, 0x70))
add_filled_shape(s10, 0.5, 4.8, 0.07, 0.58, EMERALD)
conc_tb = s10.shapes.add_textbox(inches(0.7), inches(4.88), inches(8.7), inches(0.45))
conc_tb.text_frame.word_wrap = True
p = conc_tb.text_frame.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
run = p.add_run()
run.text = "Технологии соответствуют современным стандартам веб-разработки"
run.font.size = Pt(14)
run.font.color.rgb = EMERALD
run.font.italic = True
run.font.name = "Calibri"


# ─── Save ────────────────────────────────────────────────────────────────────
output_path = r"C:\BSU\lababot\students\Шибитов\Kursovoi_Project\presentation.pptx"
prs.save(output_path)
print(f"Saved: {output_path}")
