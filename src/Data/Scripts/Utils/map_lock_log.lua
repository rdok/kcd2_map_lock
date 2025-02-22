local log_prefix = MOD_NAME

Log = {}

function Log.info(message, ...)
    if not IS_DEBUG then return end
    local message = string.format("$5[%s.INFO] " .. message, log_prefix, ...)
    System.LogAlways(message)
end

function Log.error(message, ...)
    local message = string.format("$4[%s.ERROR] " .. message, log_prefix, ...)
    System.LogAlways(message)
end