Error = Error or {}

function Error.catch(func, ...)
    local success, result = pcall(func, ...)
    if not success then
        local stackTrace = debug.traceback(tostring(result), 2)
        Log.error("[Error] " .. stackTrace)
    end
    return success, result
end
