const { getCompiler, compile } = require("./helpers");

describe("validate options", () => {
  const tests = {
    type: {
      success: ["module", "commonjs"],
      failure: ["string", "", {}, []],
    },
    imports: {
      success: [
        "lib_1",
        "globalObject1.foo",
        ["globalObject1"],
        ["globalObject1.foo"],
        {
          moduleName: "jQuery",
          name: "$",
        },
        {
          syntax: "default",
          moduleName: "jQuery",
          name: "lib",
        },
        {
          syntax: "named",
          moduleName: "jQuery",
          name: "lib",
        },
        {
          syntax: "named",
          moduleName: "jQuery",
          name: "lib",
          alias: "lib_alias",
        },
        {
          syntax: "namespace",
          moduleName: "jQuery",
          name: "$",
        },
        {
          syntax: "side-effects",
          moduleName: "jQuery",
        },
        {
          syntax: "single",
          moduleName: "jQuery",
          name: "lib",
        },
        {
          syntax: "multiple",
          moduleName: "jQuery",
          name: "lib",
          alias: "lib_alias",
        },
        {
          syntax: "multiple",
          moduleName: "jQuery",
          name: "lib",
        },
        {
          syntax: "pure",
          moduleName: "jQuery",
        },
      ],
      failure: [
        false,
        true,
        /test/,
        "",
        [],
        [""],
        {},
        {
          type: "string",
          moduleName: "jQuery",
          list: false,
        },
        {
          syntax: "default",
          moduleName: "jQuery",
          name: "lib",
          alias: "lib_alias",
        },
      ],
    },
    wrapper: {
      success: [
        true,
        false,
        "window",
        { thisArg: "window" },
        { thisArg: "window", args: ["foo", "bar"] },
        { thisArg: "window", args: { foo: "bar" } },
      ],
      failure: [
        [],
        [""],
        /test/,
        {},
        { unknown: true },
        { thisArg: 1 },
        { thisArg: "window", args: true },
        { thisArg: "window", args: [1, "bar"] },
      ],
    },
    additionalCode: {
      success: ["var x = 2;"],
      failure: [false, true, /test/, [], [""], {}],
    },
    unknown: {
      success: [],
      failure: [1, true, false, "test", /test/, [], {}, { foo: "bar" }],
    },
  };

  function stringifyValue(value) {
    if (
      Array.isArray(value) ||
      (value && typeof value === "object" && value.constructor === Object)
    ) {
      return JSON.stringify(value);
    }

    return value;
  }

  async function createTestCase(key, value, type) {
    it(`should ${
      type === "success" ? "successfully validate" : "throw an error on"
    } the "${key}" option with "${stringifyValue(value)}" value`, async () => {
      let compiler;

      if (key === "type") {
        compiler = getCompiler("some-library.js", {
          [key]: value,
          wrapper: "window",
        });
      } else {
        compiler = getCompiler("some-library.js", {
          [key]: value,
        });
      }

      let stats;

      try {
        stats = await compile(compiler);
      } finally {
        if (type === "success") {
          const validationErrors = [];

          stats.compilation.errors.forEach((error) => {
            if (error.message.indexOf("ValidationError") !== -1) {
              validationErrors.push(error);
            }
          });

          expect(validationErrors.length).toBe(0);
        } else if (type === "failure") {
          const {
            compilation: { errors },
          } = stats;

          expect(errors).toHaveLength(1);
          expect(() => {
            throw new Error(errors[0].error.message);
          }).toThrowErrorMatchingSnapshot();
        }
      }
    });
  }

  for (const [key, values] of Object.entries(tests)) {
    for (const type of Object.keys(values)) {
      for (const value of values[type]) {
        createTestCase(key, value, type);
      }
    }
  }
});
