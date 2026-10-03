Set ws = CreateObject("WScript.Shell")
dir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
ws.CurrentDirectory = dir
ws.Run """D:\Anaconda3\pythonw.exe"" """ & dir & "\desktop.py""", 0, False
