const fizzbuzz = require('../../src/model/fizzbuzz.js')
const assert = require('assert')

const numbers = fizzbuzz(50)

describe("fizzbuzz", () => {
  it("15の倍数のときはFizzBuzz", () => assert.equal(numbers[45 - 1], "FizzBuzz"))

  it("3の倍数かつ5の倍数でないときはFizz", () => assert.equal(numbers[6 - 1], "Fizz"))

  it("3の倍数でないかつ5の倍数のときはBuzz", () => assert.equal(numbers[10 - 1], "Buzz"))

  it("それ以外のときは数字", () => assert.equal(numbers[23 - 1], 23))
})