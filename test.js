
let adminBalance = { parity: 450 };

function getResult(array, betCategory) {
    let sortData = [...array]
    sortData.sort((a, b) => a - b);
    let data = -1;
    console.log(sortData)
    console.log(adminBalance[betCategory])
    for (i = 0; i <= 10; i++) {
        console.log(sortData[i] > adminBalance[betCategory], sortData[i], adminBalance[betCategory])
        if (sortData[i] > adminBalance[betCategory]) {

            if (i == 0) {
                data = sortData[i];
                break;
            }
            else {
                data = sortData[i - 1];
                break;
            }
        }
    }
    console.log("data is ", data);
    if (data = -1) {
        if (sortData[9] == 0)
            return Math.floor(Math.random() * 9) + 1;
        else
            data = sortData[9];
    }
    console.log(data)
    for (i = 0; i < 10; i++) {
        if (data == array[i]) {
            return i;
        }
    }
}


console.log(getResult([0, 32, 234, 0, 411, 123423, 0, 0, 0], "parity"));