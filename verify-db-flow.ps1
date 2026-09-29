$ErrorActionPreference = 'Stop'

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$donorLogin = Invoke-RestMethod -Uri 'http://localhost:8000/api/login.php' -Method Post -ContentType 'application/json' -Body '{"email":"donor@demo.com","password":"demo123"}' -WebSession $session
Write-Host 'DONOR LOGIN:'
$donorLogin | ConvertTo-Json -Depth 10

$donationPayload = '{"donorId":"U-1","title":"Frontend DB Test","categoryId":"C1","quantity":"10","unit":"packs","preparedAt":"2026-09-29T10:00:00","expiresAt":"2026-09-29T18:00:00","pickupAddress":"House 12, Dhaka","contact":"+8801700000000"}'
$donation = Invoke-RestMethod -Uri 'http://localhost:8000/api/donations.php' -Method Post -ContentType 'application/json' -Body $donationPayload -WebSession $session
Write-Host 'CREATED DONATION:'
$donation | ConvertTo-Json -Depth 10

& "C:\xampp\mysql\bin\mysql.exe" -uroot -D food_waste_management -e "SELECT donationId, donorId, title, status, categoryId FROM FoodDonation WHERE donationId = '$($donation.donationId)';"

$profilePayload = '{"name":"Amina Rahman Updated","phone":"+8801700000123"}'
$profile = Invoke-RestMethod -Uri 'http://localhost:8000/api/users.php?id=U-1' -Method Patch -ContentType 'application/json' -Body $profilePayload -WebSession $session
Write-Host 'PROFILE UPDATE:'
$profile | ConvertTo-Json -Depth 10

& "C:\xampp\mysql\bin\mysql.exe" -uroot -D food_waste_management -e "SELECT userId, name, phone, status FROM AppUser WHERE userId = 'U-1';"

$recipientSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$recipientLogin = Invoke-RestMethod -Uri 'http://localhost:8000/api/login.php' -Method Post -ContentType 'application/json' -Body '{"email":"recipient@demo.com","password":"demo123"}' -WebSession $recipientSession
Write-Host 'RECIPIENT LOGIN:'
$recipientLogin | ConvertTo-Json -Depth 10

$requestPayload = '{"donationId":"' + $donation.donationId + '","recipientId":"U-2","recipientName":"Hope Shelter Trust","requestedQuantity":"5","peopleToServe":"20","notes":"Frontend request validation"}'
$request = Invoke-RestMethod -Uri 'http://localhost:8000/api/requests.php' -Method Post -ContentType 'application/json' -Body $requestPayload -WebSession $recipientSession
Write-Host 'CREATED REQUEST:'
$request | ConvertTo-Json -Depth 10

& "C:\xampp\mysql\bin\mysql.exe" -uroot -D food_waste_management -e "SELECT requestId, donationId, recipientId, recipientName, status, requestedQuantity FROM Request WHERE recipientName = 'Hope Shelter Trust' ORDER BY createdAt DESC LIMIT 1; SELECT notificationId, userId, message FROM Notification WHERE userId = 'U-1' ORDER BY createdAt DESC LIMIT 1;"
