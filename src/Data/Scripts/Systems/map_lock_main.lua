Log.info("Mod Loaded.")

mapLock = mapLock or {
    ZoomLevel = nil,
    PosX = nil,
    PosY = nil
}

function mapLock:eventDispatched(elementName, instanceID, eventName)
    Error.catch(function()
        Log.info(string.format(
            "ElementEvent: actionName: %s, instanceId: %s, eventName: %s",
            elementName,
            instanceID,
            eventName
        ))

        local zoomLevel = UIAction.CallFunction(elementName, instanceID, "GetZoomLevel")
        Log.info("GetZoomLevel: " .. tostring(zoomLevel))
        local posX = UIAction.CallFunction(elementName, instanceID, "GetPosX")
        Log.info("getPosX: " .. tostring(posX))
        local posY = UIAction.CallFunction(elementName, instanceID, "GetPosY")
        Log.info("getPosY: " .. tostring(posY))

        if eventName == 'OnPlayAudio' then
            Log.info("Caching positions.")
            mapLock.ZoomLevel = zoomLevel
            mapLock.PosX = posX
            mapLock.PosY = posY
            return
        end

        if eventName ~= 'OnUnload' or self.ZoomLevel == nil then return end

        Log.info(string.format(
            "Setting user config: ZoomLevel: %s, PosX: %s, PosY: %s",
            tostring(self.ZoomLevel),
            tostring(self.PosX),
            tostring(self.PosY)
        ))
        UIAction.CallFunction(
            elementName,
            instanceID,
            "SetUserConfig",
            self.ZoomLevel,
            self.PosX,
            self.PosY
        )
        Log.info("done")
    end)
end

UIAction.RegisterElementListener(mapLock, "ApseMap", -1, "", "eventDispatched")
