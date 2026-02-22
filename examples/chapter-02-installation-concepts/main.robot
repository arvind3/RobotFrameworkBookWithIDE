*** Settings ***
Resource    resources/environment.resource
Library    libraries/install_notes.py

*** Test Cases ***
Environment Should Be Ready
    Validate Environment
    ${tip}=    Installation Tip
    Should Contain    ${tip}    pinned
