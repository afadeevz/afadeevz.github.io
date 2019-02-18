function buildNumber() {
    let number = document.getElementById("number");

    const numberBase64 = "KzcgKDk4NykgNzMyLTAwLTA2";

    number.addEventListener("mouseover", () => {
        number.innerHTML = atob(numberBase64);
    });
}

function buildAge() {
    const birthDateBase64 = "MTk5Ny0wOC0xOVQwNzowMDowMCswMzowMA==";
    const birthDate = new Date(atob(birthDateBase64));
    const currentDate = new Date();

    const yearDiff = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    const dayDiff = currentDate.getDate() - birthDate.getDate();

    let ageValue = yearDiff - 1;
    if (monthDiff > 0) {
        ageValue += 1;
    } else if (monthDiff == 0 && dayDiff >= 0) {
        ageValue += 1;
    }

    let age = document.getElementById("age");
    age.innerHTML = ageValue;
}

buildNumber();
buildAge();