function buildNumber() {
    let number = document.getElementById("number");

    const countryCode = 7;
    const areaCode = 3 * 7 * 47;
    const foo = 2 * 2 * 3 * 61;
    const bar = "00";
    const baz = "06";
    const nbsp = "&nbsp;" // Non-breaking space

    const str = `+${countryCode}${nbsp}(${areaCode})${nbsp}${foo}-${bar}-${baz}`;
    number.addEventListener("mouseover", () => {
        number.innerHTML = str;
    });
}

function buildAge() {
    const birthDate = new Date(Math.floor(5*5*17*47 / 10), 2*2*2 - 1, 20-1);
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