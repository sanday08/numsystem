let sortData = [0, 55, 0, 0, 45, 0, 0, 42, 45, 54, 55, 84]

let adminBalance = 50;

console.log(getResult(sortData))
function getResult(array) {
    let sortData = [...array]
    sortData.sort((a, b) => a - b);
    let data = -1;
    for (let i = 0; i <= 10; i++) {
        if (sortData[i] > adminBalance) {
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
    if (data == -1) {
        if (sortData[9] == 0)
            return Math.floor(Math.random() * 9) + 1;
        else
            data = sortData[9];
    }

    if (data == 0)
        while (true) {
            let finalNum = Math.floor(Math.random() * 10);
            console.log(finalNum)
            if (array[finalNum] == 0) {
                console.log("sandipS");
                return finalNum;
            }
        }
    for (let i = 0; i < 10; i++) {
        if (data == array[i])
            return i;
    }
}
