var array = [1, 2, 1, 4, 1,1, 8, 9, 1,14];

function getMinKeys(array) {
    var min = Math.min.apply(Math, array);
    return array.reduce(function (r, a, i) {
        a === min && r.push(i);
        return r;
    }, []);   
}
const result=getMinKeys(array);
const random = Math.floor(Math.random() * result.length);
console.log(result[random]);
console.log(getMinKeys(array));