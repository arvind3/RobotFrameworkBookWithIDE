*** Settings ***
Resource    ../resources/shared.resource
Variables    ../variables/profile.py
Library    ../libraries/profile_library.py

*** Test Cases ***
Enterprise Profile Is Applied
    ${message}=    Profile Message    ${PROFILE_NAME}
    Should Contain    ${message}    ${PROFILE_NAME}
    Log Shared Setup
