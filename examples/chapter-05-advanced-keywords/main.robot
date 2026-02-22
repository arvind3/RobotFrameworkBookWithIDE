*** Settings ***
Resource    keywords/advanced.resource
Resource    resources/assertions.resource

*** Test Cases ***
Advanced Keyword Flow
    ${result}=    Build Greeting    Tester    evening
    Assert Greeting Prefix    ${result}
