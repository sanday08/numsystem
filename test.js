var numArray = [140000, 104, 99];

sortData = (numArray) => {
    let a = [...numArray]
    a.sort(function (a, b) {
        return a - b;
    });

    console.log(a);

}


sortData(numArray);

console.log(numArray);