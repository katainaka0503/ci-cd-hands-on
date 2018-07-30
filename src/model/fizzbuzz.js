module.exports = (number) => {
  let result = [];

  for (let i = 1; i <= number; i++) {
    if (i % 15 == 0) {
      result.push("FizzBuzz");
    } else if (i % 3 == 0) {
      result.push("Fizz");
    } else if (i % 5 == 0) {
      result.push("Buzz");
    } else {
      result.push(i);
    }
  }

  return result;
}