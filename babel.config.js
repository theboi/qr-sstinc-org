module.exports = {
  presets: [
    [
      "next/babel",
      {
        "preset-env": {
          targets: {
            node: "current"
          }
        },
      }
    ]
  ],
  plugins: []
}