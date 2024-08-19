local status_ok, smart_splits = pcall(require, "smart-splits")

if not status_ok then
    print("smart-splits didn't load check yours " .. vim.fn.stdpath("config") .. "/lua/plugins/smartsplits.lua")
    return
end

smart_splits.setup()
