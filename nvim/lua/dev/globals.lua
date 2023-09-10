function P(v)
    print(vim.inspect(v))
    return v
end


 function PROTECTED(func, module_name)
     local status_ok, name = pcall(func, module_name)
 
     if not status_ok then
         print(module_name .. " didn't load check yours " .. vim.fn.expand('%:p'))
         return
     end
 
     return name
 end


