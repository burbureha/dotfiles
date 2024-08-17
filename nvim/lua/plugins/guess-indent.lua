return {
  {
    "NMAC427/guess-indent.nvim",
    config = function()
      require("guess-indent").setup({
        auto_cmd = true, -- Set to false to disable automatic execution
        override_editorconfig = false,
      })
    end,
  },
}
