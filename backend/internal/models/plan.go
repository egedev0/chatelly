package models

// PlanLimits defines limits for each subscription plan
type PlanLimits struct {
	Plan            string `json:"plan"`
	MaxWebsites     int    `json:"max_websites"`
	MaxChatsPerDay  int    `json:"max_chats_per_day"`
	MaxMessages     int    `json:"max_messages"`
	Translation     bool   `json:"translation"`
	Moderation      bool   `json:"moderation"`
	CustomBranding  bool   `json:"custom_branding"`
	Analytics       bool   `json:"analytics"`
	APIAccess       bool   `json:"api_access"`
	PrioritySupport bool   `json:"priority_support"`
}

// GetPlanLimits returns the limits for a given plan
func GetPlanLimits(plan string) PlanLimits {
	switch plan {
	case "free":
		return PlanLimits{
			Plan:            "free",
			MaxWebsites:     1,
			MaxChatsPerDay:  10,
			MaxMessages:     100,
			Translation:     false,
			Moderation:      false,
			CustomBranding:  false,
			Analytics:       false,
			APIAccess:       false,
			PrioritySupport: false,
		}
	case "starter":
		return PlanLimits{
			Plan:            "starter",
			MaxWebsites:     3,
			MaxChatsPerDay:  100,
			MaxMessages:     1000,
			Translation:     false,
			Moderation:      false,
			CustomBranding:  false,
			Analytics:       true,
			APIAccess:       false,
			PrioritySupport: false,
		}
	case "pro":
		return PlanLimits{
			Plan:            "pro",
			MaxWebsites:     10,
			MaxChatsPerDay:  1000,
			MaxMessages:     10000,
			Translation:     true,
			Moderation:      true,
			CustomBranding:  true,
			Analytics:       true,
			APIAccess:       true,
			PrioritySupport: false,
		}
	case "pro_max":
		return PlanLimits{
			Plan:            "pro_max",
			MaxWebsites:     -1, // unlimited
			MaxChatsPerDay:  -1, // unlimited
			MaxMessages:     -1, // unlimited
			Translation:     true,
			Moderation:      true,
			CustomBranding:  true,
			Analytics:       true,
			APIAccess:       true,
			PrioritySupport: true,
		}
	default:
		return GetPlanLimits("free")
	}
}

// GetAllPlans returns all available plans with their limits
func GetAllPlans() []PlanLimits {
	return []PlanLimits{
		GetPlanLimits("free"),
		GetPlanLimits("starter"),
		GetPlanLimits("pro"),
		GetPlanLimits("pro_max"),
	}
}

// IsValidPlan checks if a plan name is valid
func IsValidPlan(plan string) bool {
	validPlans := []string{"free", "starter", "pro", "pro_max"}
	for _, validPlan := range validPlans {
		if plan == validPlan {
			return true
		}
	}
	return false
}