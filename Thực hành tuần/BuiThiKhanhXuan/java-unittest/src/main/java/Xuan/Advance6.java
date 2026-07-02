package Xuan;

import java.time.LocalDate;
import java.time.Period;

public class Advance6 {

    public int tinhTuoi(int ngay, int thang, int nam) {
        LocalDate now = LocalDate.now();
        if (ngay <= 0 || thang <= 0 || nam <= 0) {
            return -1;
        }
        if (nam > now.getYear()) {
            return -1;
        }
        LocalDate birthDate = LocalDate.of(nam, thang, ngay);
        return Period.between(birthDate, now).getYears();
    }
}
