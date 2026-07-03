package Xuan;

import java.util.Calendar;

public class Advance7 {

    public int tinhThu(int ngay, int thang, int nam) {
        if (ngay <= 0 || ngay > 31) {
            return 0;
        }
        if (thang <= 0 || thang > 12) {
            return 0;
        }
        if (nam <= 0) {
            return 0;
        }
        Calendar calendar = Calendar.getInstance();
        calendar.set(nam, thang - 1, ngay);
        return calendar.get(Calendar.DAY_OF_WEEK);
    }
}
