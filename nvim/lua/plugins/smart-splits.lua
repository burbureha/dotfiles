return {
  {
    "mrjones2014/smart-splits.nvim",
    keys = {
      {
        "<C-Left>",
        function()
          require("smart-splits").resize_left()
        end,
      },
      {
        "<C-Right>",
        function()
          require("smart-splits").resize_right()
        end,
      },
      {
        "<C-Down>",
        function()
          require("smart-splits").resize_down()
        end,
      },
      {
        "<C-Up>",
        function()
          require("smart-splits").resize_up()
        end,
      },
    },
  },
}

-- keymap("n", "<C-Left>", require("smart-splits").resize_left)
-- keymap("n", "<C-Down>", require("smart-splits").resize_down)
-- keymap("n", "<C-Up>", require("smart-splits").resize_up)
-- keymap("n", "<C-Right>", require("smart-splits").resize_right)
