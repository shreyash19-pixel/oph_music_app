import React,{useState,useEffect} from 'react'
import axiosApi from '../../../../conf/axios';
import SearchableDynamicTable from '../../../../components/SearchableDynamicTable';
import ArtistSidebar from '../../../../components/ArtistSidebar';


const PaymentWithdraw = () => {
   const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axiosApi.get("/getAllWithdraw");
      setTableData(res.data.data);  
      console.log(res.data.data);
    };

    fetchData();
  }, []);
  return (
    <div>
      <ArtistSidebar>
        <SearchableDynamicTable
          title="Withdraw"
          data={tableData}
          showStatusIndicator={false}
          pageSize={10}
          detailsUrl="/Withdraw"
        />
      </ArtistSidebar>
    </div>
  );
  
}

export default PaymentWithdraw;
