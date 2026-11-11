
export type FormState = { error?: string; ok?: boolean } | undefined;

export type PetInput = {
    name: string;
    type: string;
    breed?: string;
    age?: number;
};

export function parsePet(formData: FormData): { error: string } | { data: PetInput } {
    const name = String(formData.get("name") ?? "").trim();
    const type = String(formData.get("type") ?? "").trim();
    const breed = String(formData.get("breed") ?? "").trim() || undefined;
    const ageRaw = String(formData.get("age") ?? "").trim();

    if (!name) return { error: "Numele animalului este obligatoriu." };
    if (!type) return { error: "Alege tipul animalului." };

    let age: number | undefined;
    if (ageRaw !== "") {
        age = Number(ageRaw);
        if (!Number.isInteger(age) || age < 0 || age > 60) {
            return { error: "Vârsta trebuie să fie un număr întreg între 0 și 60." };
        }
    }

    return { data: { name, type, breed, age } };
}