import Announcements from "@/components/announcements/Announcements";
import {Header} from "@/components/header/Header";
import Services from "@/components/services/Services";

export default function HomePage() {
  return (
      <div>
          <Header></Header>
          <Announcements></Announcements>
          <Services></Services>
      </div>
  );
}