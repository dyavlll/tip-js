from pathlib import Path
from shutil import copy2
from docx import Document
from docx.shared import Cm,Pt
from docx.enum.section import WD_SECTION_START,WD_ORIENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from PIL import Image

project=Path(__file__).resolve().parents[1]
root=project.parent

def picture_section(doc,image_path,caption,anchor=None):
    body=doc.element.body
    existing=list(body)
    section=doc.add_section(WD_SECTION_START.NEW_PAGE)
    section.orientation=WD_ORIENT.LANDSCAPE
    section.page_width=Cm(29.7);section.page_height=Cm(21)
    section.top_margin=Cm(1.3);section.bottom_margin=Cm(1.3)
    section.left_margin=Cm(2);section.right_margin=Cm(2)
    heading=doc.add_heading('Результат выполнения',2)
    heading.paragraph_format.space_before=Pt(0)
    p=doc.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after=Pt(2);p.paragraph_format.keep_with_next=True
    p.add_run().add_picture(str(image_path),width=Cm(25.2))
    p=doc.add_paragraph(caption);p.paragraph_format.space_after=Pt(0)
    for run in p.runs:run.font.size=Pt(10);run.italic=True
    if anchor is not None:
        reset=doc.add_section(WD_SECTION_START.NEW_PAGE)
        reset.orientation=WD_ORIENT.PORTRAIT
        reset.page_width=Cm(21);reset.page_height=Cm(29.7)
        reset.top_margin=Cm(1.8);reset.bottom_margin=Cm(1.8)
        reset.left_margin=Cm(2);reset.right_margin=Cm(2)
        new=[el for el in list(body) if el.tag.rsplit('}',1)[-1]!='sectPr' and el not in existing]
        for el in new:anchor.addprevious(el)

p1=project/'КР1_ЭФБО-06-25_ДьяковВН.docx'
doc=Document(p1)
shape=doc.inline_shapes[-1]
part=doc.part.related_parts[shape._inline.graphic.graphicData.pic.blipFill.blip.embed]
part._blob=(project/'Скриншоты/kr1-4.jpg').read_bytes()
w,h=Image.open(project/'Скриншоты/kr1-4.jpg').size
shape.width=Cm(16.7);shape.height=Cm(16.7*h/w)
doc.core_properties.author='Дьяков В.Н.'
doc.core_properties.last_modified_by='Дьяков В.Н.'
doc.save(p1)
copy2(p1,root/'01 Контрольные работы'/p1.name)

old=project/'КР2_ЭФБО-06-25_ДьяковВН_черновик.docx'
doc=Document(old)
anchor=next(p._p for p in doc.paragraphs if p.text.startswith('3. Получение задач'))
previous=anchor.getprevious()
if previous is not None and previous.xpath('.//w:br[@w:type="page"]'):
    previous.getparent().remove(previous)
picture_section(doc,project/'Скриншоты/kr2-2.png',
    'Скриншот 2. После перезагрузки задача 20 сохранена в общем списке. В Application → Local storage открыт ключ tip-js-practice-04:demo: version = 1, tasks содержит id = 20, title «Изучить localStorage», priority = high.',anchor)
picture_section(doc,project/'Скриншоты/kr2-5.png',
    'Скриншот 5. Активен только фильтр «В работе». После PATCH /api/tasks/4 со статусом 200 выполнен GET /api/tasks?completed=false со статусом 200; задача 4 исчезла из выборки. OPTIONS — предварительный CORS-запрос браузера.')
doc.core_properties.author='Дьяков В.Н.'
doc.core_properties.last_modified_by='Дьяков В.Н.'
new=project/'КР2_ЭФБО-06-25_ДьяковВН.docx'
doc.save(new)
copy2(new,root/'01 Контрольные работы'/new.name)
assert len(Document(new).inline_shapes)==6
for p in [p1,new]:
    text='\n'.join(p.text for p in Document(p).paragraphs)
    assert 'Вставьте' not in text and 'Меньшикова' not in text
    print(p.name,len(Document(p).inline_shapes),'images')
