import type { AppointmentApiRow } from "@/lib/accessors/Appointmentaccessor";
import { serviceLabel } from "@/lib/models/Appoinmentviewmodel";

export interface AppointmentDto {
    id: number;
    date: string; // ISO 8601
    service: { code: string; label: string };
    client: { id: number; name: string };
    pet: { id: number; name: string; type: string } | null;
    vet: { id: number; name: string } | null;
}

export function toAppointmentDto(row: AppointmentApiRow): AppointmentDto {
    return {
        id: row.id,
        date: row.date.toISOString(),
        service: { code: row.service, label: serviceLabel(row.service) },
        client: { id: row.user.id, name: `${row.user.lastName} ${row.user.firstName}` },
        pet: row.pet ? { id: row.pet.id, name: row.pet.name, type: row.pet.type } : null,
        vet: row.admin
            ? { id: row.admin.id, name: `Dr. ${row.admin.firstName} ${row.admin.lastName}` }
            : null,
    };
}

export const toAppointmentDtos = (rows: AppointmentApiRow[]) => rows.map(toAppointmentDto);