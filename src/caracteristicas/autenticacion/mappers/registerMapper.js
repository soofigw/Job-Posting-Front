export function mapRegistroToPayload(form) {
    // candidate
    if (form.tipo === "postulante") {
        return {
            type: "candidate",
            email: form.email,
            password: form.password,
            candidate: {
                full_name: form.nombre,
                contact: {
                    phone: form.phone,
                    email: form.email,
                },
                country: form.country,
                state: form.state,
                city: form.city,
                headline: form.headline,
            },
        };
    }

    // company
    if (form.tipo === "empresa") {
        return {
            type: "company",
            email: form.email,
            password: form.password,
            company: {
                name: form.nombre,
                description: form.description,
                country: form.country,
                state: form.state,
                city: form.city,
                address: form.address,
                company_size_min: Number(form.company_size_min),
                company_size_max: Number(form.company_size_max),
            },
        };
    }

    const e = new Error("Tipo inválido");
    e.code = "BAD_REQUEST";
    throw e;
}
