*** Settings ***
Library    ../libraries/math_lib.py
Library    ../libraries/string_lib.py
Resource    ../resources/python_keywords.resource

*** Test Cases ***
Python Library Keywords Work
    ${sum}=    Add Numbers    4    6
    Should Be Equal As Integers    ${sum}    10
    ${label}=    Build Label    robot
    Validate Label    ${label}
