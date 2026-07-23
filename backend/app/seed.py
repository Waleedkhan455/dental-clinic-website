"""Seed the database with initial data: the three doctors, all services from
the specification, and sample testimonials.

Idempotent — each record is upserted by a natural key (doctor name, service
slug, testimonial name+message), so running it repeatedly will not create
duplicates. Run from the ``backend`` directory:

    python -m app.seed
"""

import asyncio
import logging

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import get_settings
from app.db import collections as c
from app.db.indexes import ensure_indexes
from app.models.common import AvailabilityType, utcnow
from app.models.doctor import Availability, DoctorCreate
from app.models.service import ServiceCreate
from app.models.testimonial import TestimonialCreate

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("seed")


DOCTORS: list[DoctorCreate] = [
    DoctorCreate(
        name="Dr. Safa Nawaz",
        designation="Assistant Professor, Ayub Medical College",
        qualifications=["FCPS Prosthodontics", "Implantologist"],
        bio=(
            "Dr. Safa Nawaz is an FCPS-qualified prosthodontist and implantologist, "
            "and an Assistant Professor at Ayub Medical College. She focuses on dental "
            "implants and full-mouth rehabilitation."
        ),
        availability=Availability(
            type=AvailabilityType.SPECIFIC_DAYS,
            weekdays=[4],  # Friday (Mon=0 … Sun=6)
            label="Fridays only",
        ),
    ),
    DoctorCreate(
        name="Dr. Naveed Iqbal",
        designation="Lecturer, Ayub Medical College",
        qualifications=["Orthodontist"],
        bio=(
            "Dr. Naveed Iqbal is an orthodontist and Lecturer at Ayub Medical College, "
            "treating alignment and bite problems with braces and clear aligners."
        ),
        availability=Availability(
            type=AvailabilityType.BY_APPOINTMENT,
            weekdays=[],
            label="By prior appointment",
        ),
    ),
    DoctorCreate(
        name="Dr. Haseeb Ahmad",
        designation="General Dental Practitioner",
        qualifications=["General Dental Practitioner"],
        bio=(
            "Dr. Haseeb Ahmad is a general dental practitioner providing routine "
            "checkups, fillings, and preventive care during regular clinic hours."
        ),
        availability=Availability(
            type=AvailabilityType.REGULAR_HOURS,
            weekdays=[],
            label="Regular clinic hours",
        ),
    ),
]


def _service(name: str, slug: str, category: str, description: str, visits: str) -> ServiceCreate:
    return ServiceCreate(
        name=name, slug=slug, category=category, description=description, visits_text=visits
    )


GENERAL = "General Dentistry"
RESTORATIVE = "Restorative & Prosthodontics"
ORTHODONTICS = "Orthodontics"
COSMETIC = "Cosmetic Dentistry"
PEDIATRIC = "Pediatric Dentistry"


SERVICES: list[ServiceCreate] = [
    _service(
        "Dental Checkups", "dental-checkups", GENERAL,
        "A routine examination and professional cleaning help maintain healthy teeth and "
        "gums. Regular visits allow early detection of dental issues and removal of plaque "
        "and tartar buildup.",
        "1",
    ),
    _service(
        "Scaling & Polishing", "scaling-and-polishing", GENERAL,
        "Professional scaling and polishing removes plaque, tartar, and surface stains, "
        "leaving teeth clean and smooth.",
        "1",
    ),
    _service(
        "Fillings", "fillings", GENERAL,
        "Dental fillings restore teeth damaged by cavities or minor fractures. The decayed "
        "portion is removed and replaced with a durable filling material to restore function "
        "and appearance.",
        "1",
    ),
    _service(
        "Root Canal Treatment", "root-canal-treatment", GENERAL,
        "A root canal treats infection or damage within the tooth's pulp. The infected tissue "
        "is removed, the canals are cleaned and sealed, and the tooth is preserved from "
        "extraction.",
        "1–3, depending on case complexity",
    ),
    _service(
        "Extractions", "extractions", GENERAL,
        "Tooth extraction involves the safe removal of a damaged, infected, or problematic "
        "tooth when it cannot be restored. The procedure is performed with patient comfort as "
        "a priority.",
        "1",
    ),
    _service(
        "Gum Disease Treatment", "gum-disease-treatment", GENERAL,
        "Periodontal treatment addresses gum infection and inflammation through deep cleaning "
        "and other therapies to restore gum health and prevent tooth loss.",
        "1–4, depending on disease severity",
    ),
    _service(
        "Wisdom Tooth Removal", "wisdom-tooth-removal", GENERAL,
        "Wisdom tooth extraction is performed when third molars are impacted, causing pain, "
        "infection, or crowding. The procedure helps protect adjacent teeth and maintain oral "
        "health.",
        "1 (plus follow-up if required)",
    ),
    _service(
        "Crowns & Bridges", "crowns-and-bridges", RESTORATIVE,
        "Crowns are custom-made caps placed over damaged or weakened teeth to restore "
        "strength, function, and aesthetics while protecting the remaining tooth structure.",
        "2 (preparation and placement)",
    ),
    _service(
        "Dentures", "dentures", RESTORATIVE,
        "Dentures are removable prosthetic appliances designed to replace missing teeth and "
        "restore chewing ability, speech, and facial appearance.",
        "3–5",
    ),
    _service(
        "Dental Implants", "dental-implants", RESTORATIVE,
        "Dental implants are a long-lasting solution for replacing missing teeth. A titanium "
        "implant is placed in the jawbone and, after healing, a custom-made crown is attached "
        "to restore function and appearance.",
        "3–5 over several months, depending on healing time",
    ),
    _service(
        "Braces & Aligners", "braces-and-aligners", ORTHODONTICS,
        "Orthodontic treatment corrects misaligned teeth and bite problems, improving both "
        "oral health and smile aesthetics.",
        "Initial consultation plus regular adjustment/review visits over 6–24 months",
    ),
    _service(
        "Teeth Whitening", "teeth-whitening", COSMETIC,
        "Professional teeth whitening safely removes stains and discoloration, helping "
        "patients achieve a brighter, more confident smile.",
        "1",
    ),
    _service(
        "Dental Veneers", "dental-veneers", COSMETIC,
        "Veneers are thin, custom-made porcelain or composite shells bonded to the front of "
        "teeth to enhance their color, shape, size, and overall appearance.",
        "2",
    ),
    _service(
        "Smile Makeover", "smile-makeover", COSMETIC,
        "A smile makeover combines multiple cosmetic and restorative dental treatments "
        "tailored to improve the appearance and function of your smile.",
        "Varies by treatment plan, typically 2–6",
    ),
    _service(
        "Children's Dental Care", "childrens-dental-care", PEDIATRIC,
        "Children's dental care focuses on preventive treatments, oral health education, and "
        "gentle management of developing teeth and gums.",
        "Usually 1, with regular checkups every 6 months",
    ),
]


# Sample testimonials (placeholder content, editable from the doctor panel).
TESTIMONIALS: list[TestimonialCreate] = [
    TestimonialCreate(
        patient_name="Ayesha K.",
        message=(
            "The implant procedure was smooth and painless. Dr. Safa explained every step and "
            "the result looks completely natural."
        ),
        rating=5,
    ),
    TestimonialCreate(
        patient_name="Bilal R.",
        message=(
            "I got my braces here. The team is professional and the clinic is very clean. "
            "Highly recommended for anyone in Mansehra."
        ),
        rating=5,
    ),
    TestimonialCreate(
        patient_name="Fatima S.",
        message=(
            "Very caring staff. My daughter was nervous about her checkup but they made her "
            "feel comfortable throughout."
        ),
        rating=5,
    ),
    TestimonialCreate(
        patient_name="Usman T.",
        message="Quick appointment for a filling with no waiting, and honest, clear advice.",
        rating=4,
    ),
]


async def seed() -> None:
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongo_uri, serverSelectionTimeoutMS=10000)
    db = client[settings.mongo_db_name]
    try:
        await client.admin.command("ping")
        logger.info("Connected to '%s'", settings.mongo_db_name)
        await ensure_indexes(db)

        for doctor in DOCTORS:
            data = doctor.model_dump(mode="json")
            await db[c.DOCTORS].update_one(
                {"name": doctor.name},
                {"$set": data, "$setOnInsert": {"created_at": utcnow()}},
                upsert=True,
            )
        logger.info("Seeded %d doctors", len(DOCTORS))

        for service in SERVICES:
            data = service.model_dump(mode="json")
            await db[c.SERVICES].update_one(
                {"slug": service.slug},
                {"$set": data, "$setOnInsert": {"created_at": utcnow()}},
                upsert=True,
            )
        logger.info("Seeded %d services", len(SERVICES))

        for testimonial in TESTIMONIALS:
            data = testimonial.model_dump(mode="json")
            await db[c.TESTIMONIALS].update_one(
                {"patient_name": testimonial.patient_name, "message": testimonial.message},
                {"$set": data, "$setOnInsert": {"created_at": utcnow()}},
                upsert=True,
            )
        logger.info("Seeded %d testimonials", len(TESTIMONIALS))

        logger.info("Seed complete.")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(seed())
