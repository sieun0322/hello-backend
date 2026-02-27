package idgen

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

// Base62Encode int64 ID를 Base62 문자열로 변환한다.
// 62종 문자(0-9, a-z, A-Z)를 사용하여 짧은 코드를 만든다.
func Base62Encode(id int64) string {
	if id == 0 {
		return string(alphabet[0])
	}

	n := uint64(id)
	buf := make([]byte, 0, 11) // int64 최대값 기준 Base62 최대 11자리

	for n > 0 {
		buf = append(buf, alphabet[n%62])
		n /= 62
	}

	// 역순 정렬
	for i, j := 0, len(buf)-1; i < j; i, j = i+1, j-1 {
		buf[i], buf[j] = buf[j], buf[i]
	}

	return string(buf)
}
