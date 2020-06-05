import { getCompiler, compile } from './helpers';

describe('validate options', () => {
  const tests = {
    import: {
      success: [
        'lib_1',
        'globalObject1.foo',
        ['globalObject1'],
        ['globalObject1.foo'],
        {
          names: false,
        },
        {
          names: [
            'lib',
            {
              name: 'lib',
            },
            {
              name: 'lib',
              alias: 'lib',
            },
            {
              name: 'lib',
              default: true,
            },
            {
              alias: 'lib',
              nameSpace: true,
            },
            [
              'lib',
              {
                name: 'lib',
              },
              {
                name: 'lib',
                alias: 'lib',
              },
              {
                name: 'lib',
                default: true,
              },
              {
                alias: 'lib',
                nameSpace: true,
              },
            ],
          ],
        },
      ],
      failure: [false, true, /test/, '', [], [''], {}],
    },
    wrapper: {
      success: ['windows'],
      failure: [false, true, /test/, [], [''], {}],
    },
    additionalCode: {
      success: ['var x = 2;'],
      failure: [false, true, /test/, [], [''], {}],
    },
    unknown: {
      success: [],
      failure: [1, true, false, 'test', /test/, [], {}, { foo: 'bar' }],
    },
  };

  function stringifyValue(value) {
    if (
      Array.isArray(value) ||
      (value && typeof value === 'object' && value.constructor === Object)
    ) {
      return JSON.stringify(value);
    }

    return value;
  }

  async function createTestCase(key, value, type) {
    it(`should ${
      type === 'success' ? 'successfully validate' : 'throw an error on'
    } the "${key}" option with "${stringifyValue(value)}" value`, async () => {
      const compiler = getCompiler('some-library.js', {
        [key]: value,
      });

      let stats;

      try {
        stats = await compile(compiler);
      } finally {
        if (type === 'success') {
          const validationErrors = [];

          stats.compilation.errors.forEach((error) => {
            if (error.message.indexOf('ValidationError') !== -1) {
              validationErrors.push(error);
            }
          });
          expect(validationErrors.length).toBe(0);
        } else if (type === 'failure') {
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
