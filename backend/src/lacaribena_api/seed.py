from sqlalchemy import select

from lacaribena_api.db.session import SessionLocal
from lacaribena_api.models import Category

CATEGORIES = [
    ("Pijamas", "pijamas", "#8C2A28"),
    ("Lencería", "lenceria", "#6E0F0D"),
    ("Bikinis", "bikinis", "#DCA396"),
    ("Encajes", "encajes", "#B8863B"),
]


def main() -> None:
    with SessionLocal() as db:
        existing = set(db.scalars(select(Category.slug)).all())
        created = 0
        for name, slug, color in CATEGORIES:
            if slug in existing:
                continue
            db.add(Category(name=name, slug=slug, color=color))
            created += 1
        db.commit()
    print(
        f"Seed complete: {created} categories created, "
        f"{len(CATEGORIES) - created} already present."
    )


if __name__ == "__main__":
    main()
