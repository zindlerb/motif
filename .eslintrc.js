module.exports = {
    "extends": "airbnb",
    "installedESLint": true,
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
  "rules": {
    "no-restricted-properties": [0, {
      "object": "Math",
      "property": "Pow"
    }],
    "prefer-template": 0,
    "no-underscore-dangle": 0,
    "no-param-reassign": 0,
    "func-names": 0,
    "no-unreachable": 0,
    "no-else-return": 0,
    "prefer-arrow-callback": 0
  }

};
