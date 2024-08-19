local current_file = vim.fn.expand('%')

local colorscheme

if string.find(current_file, ".tex") ~= nil then
  colorscheme = "rose-pine-dawn"
else
  colorscheme = "nightfly"
end



-- local status_ok, _ = pcall(vim.cmd.colorscheme, colorscheme)
-- 
-- if not status_ok then
--     print("colorscheme " .. colorscheme .. " not found, check your .config/nvim/lua/user/colorscheme.lua")
--     return
-- end
PROTECTED(vim.cmd.colorscheme, colorscheme)
