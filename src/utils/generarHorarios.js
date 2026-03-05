export const generarHorarios = (inicio, fin) => {
    const horarios = [];
    let actual = inicio;

    while (actual < fin) {
        horarios.push(actual);

        const [h, m] = actual.split(":").map(Number);
        const fechaTemp = new Date(0, 0, 0, h, m + 30);
        actual = fechaTemp.toTimeString().slice(0, 5);
    }
    return horarios
}