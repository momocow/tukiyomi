Function finishpageaction
  ${ifNot} ${isUpdated}
    CreateShortcut "$desktop\tukiyomi.lnk" "$instdir\tukiyomi.exe"
  ${endIf}
FunctionEnd

!define MUI_FINISHPAGE_SHOWREADME ""
!define MUI_FINISHPAGE_SHOWREADME_NOTCHECKED
!define MUI_FINISHPAGE_SHOWREADME_TEXT "Create Desktop Shortcut"
!define MUI_FINISHPAGE_SHOWREADME_FUNCTION finishpageaction