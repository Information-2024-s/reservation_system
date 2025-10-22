```mermaid
erDiagram

        SlotType {
            RESERVABLE RESERVABLE
WALK_IN WALK_IN
        }
    


        SlotStatus {
            AVAILABLE AVAILABLE
BOOKED BOOKED
        }
    
  "TimeSlot" {
    Int id "🗝️"
    DateTime slotTime 
    SlotType slotType 
    SlotStatus status 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "Reservation" {
    Int id "🗝️"
    DateTime startTime 
    DateTime createdAt 
    DateTime updatedAt 
    Int timeSlotId "❓"
    String lineUserId "❓"
    }
  

  "Team" {
    Int id "🗝️"
    String name 
    Int headcount 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "Player" {
    Int id "🗝️"
    String name "❓"
    Int team_id 
    DateTime createdAt 
    DateTime updatedAt 
    }
  

  "GameSession" {
    Int id "🗝️"
    String name 
    String description "❓"
    DateTime createdAt 
    DateTime updatedAt 
    Int team_id 
    }
  

  "TeamScore" {
    Int id "🗝️"
    Int score 
    DateTime createdAt 
    DateTime updatedAt 
    Int game_session_id 
    Int team_id 
    }
  

  "PlayerScore" {
    Int id "🗝️"
    Int score 
    Int player_id "❓"
    Int team_score_id "❓"
    DateTime createdAt 
    DateTime updatedAt 
    }
  
    "TimeSlot" o|--|| "SlotType" : "enum:slotType"
    "TimeSlot" o|--|| "SlotStatus" : "enum:status"
    "TimeSlot" o{--}o "Reservation" : ""
    "Reservation" o|--|o "TimeSlot" : "timeSlot"
    "Team" o{--}o "GameSession" : ""
    "Team" o{--}o "Player" : ""
    "Team" o{--}o "TeamScore" : ""
    "Player" o|--|o "Team" : "team"
    "Player" o{--}o "PlayerScore" : ""
    "GameSession" o|--|| "Team" : "team"
    "GameSession" o{--}o "TeamScore" : ""
    "TeamScore" o{--}o "PlayerScore" : ""
    "TeamScore" o|--|| "GameSession" : "gameSession"
    "TeamScore" o|--|| "Team" : "team"
    "PlayerScore" o|--|o "Player" : "player"
    "PlayerScore" o|--|o "TeamScore" : "teamScore"
```
