// frontend/.eslintrc.js
module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true
  },
  globals: {
    process: 'readonly'
  },
  rules: {
    // Custom rules can be added here
    'no-console': 'warn',
    'no-unused-vars': 'warn'
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.test.jsx', '**/*.spec.js', '**/*.spec.jsx'],
      env: {
        jest: true,
        node: true
      },
      globals: {
        process: 'readonly'
      },
      rules: {
        'no-console': 'off' // Allow console in tests
      }
    }
  ]
};