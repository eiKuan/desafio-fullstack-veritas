package model

import "time"

type Date struct {
	Day   int8
	Month time.Month
	Year  int
}
