import { getNestedObjectValue, getSelectOptionsFromEnum } from "../objects";

describe("objects", () => {
  describe("getNestedObjectValue", () => {
    test("returns nullish values", () => {
      const testInput = { attr1: { attr2: undefined } };
      const expectedResult = undefined;
      const actualResult = getNestedObjectValue(testInput, "attr1.attr2");
      expect(actualResult).toEqual(expectedResult);
    });

    test("returns value for a non-nested path", () => {
      const testInput = { attr1: 123 };
      const expectedResult = 123;
      const actualResult = getNestedObjectValue(testInput, "attr1");
      expect(actualResult).toEqual(expectedResult);
    });

    test("doesn't throw an error when path is empty", () => {
      const testInput = { attr1: { attr2: undefined } };
      const expectedResult = testInput;
      const actualResult = getNestedObjectValue(testInput, "");
      expect(actualResult).toEqual(expectedResult);
    });

    test("returns value of nested object with multi layered nested keys", () => {
      const testInput = { nested: { attr1: 123, attr2: { test: { test2: { test3: 1 } } } } };
      const expectedResult = 1;
      const actualResult = getNestedObjectValue(testInput, "nested.attr2.test.test2.test3");
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe("getSelectOptionsFromEnum", () => {
    const TestEnum = {
      Option1: "Option 1",
      Option2: "Option 2",
      Option3: "Option 3",
    } as const;

    test("returns an array of options with correct value and label", () => {
      const options = getSelectOptionsFromEnum(TestEnum);
      expect(options).toEqual([
        { value: "Option1", label: "Option 1" },
        { value: "Option2", label: "Option 2" },
        { value: "Option3", label: "Option 3" },
      ]);
    });

    test("handles empty enum", () => {
      const EmptyEnum = {} as const;
      const options = getSelectOptionsFromEnum(EmptyEnum);
      expect(options).toEqual([]);
    });
  });
});
